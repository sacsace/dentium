import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  RESUME_ATTACHMENT_TYPES,
  ATTACHMENT_LABELS,
  type ResumePayload,
} from "@/lib/resume";
import { ResumeAttachmentType as PrismaAttachmentType } from "@prisma/client";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { savePrivateFile } from "@/lib/private-storage";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_PHOTO_SIZE = 2 * 1024 * 1024;
const ALLOWED_EXT = /\.(pdf|doc|docx|jpg|jpeg|png)$/i;
const ALLOWED_RESUME_EXT = /\.(pdf|doc|docx)$/i;
const ALLOWED_RESUME_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function isAllowedImage(file: File, maxSize = MAX_FILE_SIZE) {
  if (file.size > maxSize) return `Image must be ${Math.round(maxSize / (1024 * 1024))}MB or less`;
  if (!file.type.startsWith("image/") && !/\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
    return "Allowed formats: JPG, PNG, WebP";
  }
  return null;
}

function isAllowedFile(file: File) {
  if (file.size > MAX_FILE_SIZE) return "Each file must be 5MB or less";
  if (!ALLOWED_EXT.test(file.name) && !file.type.startsWith("image/")) {
    return "Allowed formats: PDF, DOC, DOCX, JPG, PNG";
  }
  return null;
}

function isAllowedResume(file: File) {
  if (file.size > MAX_FILE_SIZE) return "Resume must be 5MB or less";
  if (!ALLOWED_RESUME_EXT.test(file.name)) return "Resume format must be PDF, DOC, or DOCX";
  if (file.type && !ALLOWED_RESUME_MIME.has(file.type)) {
    return "Resume format must be PDF, DOC, or DOCX";
  }
  return null;
}

async function readPayload(formData: FormData): Promise<ResumePayload | null> {
  const raw = formData.get("payload");
  if (!raw) return null;

  try {
    const text = typeof raw === "string" ? raw : await raw.text();
    return JSON.parse(text) as ResumePayload;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = rateLimit(`resume:${ip}`, 5, 60 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfter);

  try {
    const formData = await req.formData();
    const payload = await readPayload(formData);
    if (!payload) {
      return NextResponse.json({ error: "Invalid submission data" }, { status: 400 });
    }

    if (!payload.name?.trim()) {
      return NextResponse.json({ error: "Please enter your full name.", field: "name" }, { status: 400 });
    }

    if (!payload.email?.trim()) {
      return NextResponse.json({ error: "Please enter your email address.", field: "email" }, { status: 400 });
    }

    if (!payload.education?.length || !payload.education.some((e) => e.school?.trim())) {
      return NextResponse.json({ error: "Please add at least one education entry (School / University).", field: "educationSchool" }, { status: 400 });
    }

    if (!payload.positionCategory?.trim()) {
      return NextResponse.json({ error: "Please select a department / role.", field: "positionCategory" }, { status: 400 });
    }

    if (payload.positionCategory === "CUSTOM" && !payload.position?.trim()) {
      return NextResponse.json({ error: "You selected Other — please specify your desired position.", field: "position" }, { status: 400 });
    }

    const selectedJob = payload.jobId
      ? await prisma.jobPosting.findFirst({
          where: { id: payload.jobId, isActive: true },
          select: { id: true, title: true, department: true },
        })
      : null;
    if (payload.jobId && !selectedJob) {
      return NextResponse.json(
        { error: "This job posting is no longer accepting applications.", field: "positionCategory" },
        { status: 400 }
      );
    }

    let photoUrl: string | null = null;
    const photoFile = formData.get("photo");
    if (photoFile instanceof File && photoFile.size > 0) {
      const photoErr = isAllowedImage(photoFile, MAX_PHOTO_SIZE);
      if (photoErr) {
        return NextResponse.json({ error: `Profile photo: ${photoErr}`, field: "photo" }, { status: 400 });
      }
      const saved = await savePrivateFile(photoFile, "resumes/photos");
      photoUrl = saved.storageKey;
    }

    const graduationFiles = formData.getAll("file_GRADUATION_CERTIFICATE") as File[];
    const transcriptFiles = formData.getAll("file_TRANSCRIPT") as File[];
    const resumeFiles = formData.getAll("file_RESUME") as File[];
    const hasGraduation = graduationFiles.some((f) => f instanceof File && f.size > 0);
    const hasTranscript = transcriptFiles.some((f) => f instanceof File && f.size > 0);
    const resumeFile = resumeFiles.find((f) => f instanceof File && f.size > 0);

    if (!resumeFile) {
      return NextResponse.json(
        { error: "Please upload your resume in PDF or Word format.", field: "attachments" },
        { status: 400 }
      );
    }
    const resumeError = isAllowedResume(resumeFile);
    if (resumeError) {
      return NextResponse.json({ error: resumeError, field: "attachments" }, { status: 400 });
    }

    if (!hasGraduation) {
      return NextResponse.json({ error: "Please attach your graduation certificate.", field: "attachments" }, { status: 400 });
    }
    if (!hasTranscript) {
      return NextResponse.json({ error: "Please attach your academic transcript / grade report.", field: "attachments" }, { status: 400 });
    }

    const attachmentRecords: { type: PrismaAttachmentType; fileName: string; fileUrl: string }[] = [];

    for (const type of RESUME_ATTACHMENT_TYPES) {
      const files = formData.getAll(`file_${type}`) as File[];
      for (const file of files) {
        if (!file || file.size === 0) continue;
        const err = isAllowedFile(file);
        if (err) return NextResponse.json({ error: `${ATTACHMENT_LABELS[type]}: ${err}` }, { status: 400 });
        const saved = await savePrivateFile(file, "resumes");
        attachmentRecords.push({
          type: type as PrismaAttachmentType,
          fileName: saved.fileName,
          fileUrl: saved.storageKey,
        });
      }
    }

    const maxOrder = await prisma.resumeApplication.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (maxOrder._max.sortOrder ?? 0) + 1;

    const application = await prisma.resumeApplication.create({
      data: {
        name: payload.name.trim(),
        email: payload.email.trim(),
        phone: payload.phone?.trim() || null,
        positionCategory: selectedJob?.department || payload.positionCategory.trim(),
        position: selectedJob?.title || payload.position?.trim() || null,
        jobId: selectedJob?.id || null,
        photoUrl,
        dateOfBirth: payload.dateOfBirth?.trim() || null,
        address: payload.address?.trim() || null,
        summary: payload.summary?.trim() || null,
        education: payload.education,
        experience: payload.experience ?? [],
        skills: payload.skills?.trim() || null,
        languages: payload.languages?.trim() || null,
        hasExperience: payload.hasExperience ?? false,
        sortOrder,
        attachments: {
          create: attachmentRecords,
        },
      },
    });

    return NextResponse.json({ success: true, id: application.id });
  } catch (error) {
    console.error("Resume submission failed:", error);
    return NextResponse.json({ error: "Failed to submit application. Please try again or contact HR." }, { status: 500 });
  }
}
