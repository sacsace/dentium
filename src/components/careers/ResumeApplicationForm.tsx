"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, Upload, CheckCircle, User, X, Info } from "lucide-react";import {
  ATTACHMENT_LABELS,
  EDUCATION_ATTACHMENT_TYPES,
  EXPERIENCE_ATTACHMENT_TYPES,
  JOB_CATEGORIES,
  emptyEducation,
  emptyExperience,
  type EducationEntry,
  type ExperienceEntry,
  type ResumeAttachmentType,
} from "@/lib/resume";

const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-brand-deep";

const inputErrorClass =
  "w-full px-3 py-2 border-2 border-red-400 rounded-sm text-sm focus:outline-none focus:border-red-500 ring-2 ring-red-100";

type FocusField = "name" | "email" | "positionCategory" | "position" | "educationSchool" | "photo" | "attachments";

function mapErrorToField(error: string, field?: string): FocusField | null {
  if (
    field === "name" ||
    field === "email" ||
    field === "positionCategory" ||
    field === "position" ||
    field === "educationSchool" ||
    field === "photo" ||
    field === "attachments"
  ) {
    return field;
  }

  const lower = error.toLowerCase();
  if (lower.includes("full name") || lower.includes("name")) return "name";
  if (lower.includes("email")) return "email";
  if (lower.includes("specify") || lower.includes("other")) return "position";
  if (lower.includes("department") || lower.includes("role")) return "positionCategory";
  if (lower.includes("profile photo")) return "photo";
  if (lower.includes("graduation certificate")) return "attachments";
  if (lower.includes("transcript")) return "attachments";
  if (lower.includes("document") || lower.includes("attach")) return "attachments";
  if (lower.includes("education") || lower.includes("school") || lower.includes("university")) {
    return "educationSchool";
  }
  return null;
}

function fieldInputClass(field: FocusField, activeField: FocusField | null) {
  return activeField === field ? inputErrorClass : inputClass;
}
const sectionClass = "border border-gray-100 rounded-sm p-5 md:p-6 space-y-4 bg-white";

function SectionTitle({ step, title, subtitle }: { step: string; title: string; subtitle?: string }) {
  return (
    <div>
      <p className="text-xs tracking-widest uppercase text-brand-accent font-medium mb-1">{step}</p>
      <h3 className="text-lg font-semibold text-brand-navy">{title}</h3>
      {subtitle && <p className="text-sm text-brand-silver mt-1">{subtitle}</p>}
    </div>
  );
}

function ProfilePhotoField({
  preview,
  active,
  sectionRef,
  inputRef,
  onSelect,
  onRemove,
  onError,
}: {
  preview: string | null;
  active: boolean;
  sectionRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSelect: (file: File) => void;
  onRemove: () => void;
  onError: (message: string) => void;
}) {
  const handleChange = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onError("Profile photo must be a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      onError("Profile photo must be 2MB or less.");
      return;
    }
    onSelect(file);
  };

  return (
    <div ref={sectionRef} className="shrink-0">
      <label className="block text-sm font-medium text-brand-navy mb-2">Profile Photo</label>
      <div
        className={`relative w-32 h-40 rounded-sm border-2 border-dashed overflow-hidden bg-brand-gray/30 ${
          active ? "border-red-400 ring-2 ring-red-100" : "border-gray-300"
        }`}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Profile preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
              aria-label="Remove photo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-brand-silver px-2">
            <User className="w-8 h-8 mb-2" />
            <span className="text-xs text-center">Passport-style photo</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          handleChange(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        size="sm"
        className="mt-2 w-full"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="w-3.5 h-3.5" />
        {preview ? "Change Photo" : "Upload Photo"}
      </Button>
      <p className="text-xs text-brand-silver mt-1">JPG, PNG, WebP · max 2MB</p>
    </div>
  );
}

function FileUploadField({
  type,
  files,
  onChange,
  required,
  highlight,
}: {
  type: ResumeAttachmentType;
  files: File[];
  onChange: (files: File[]) => void;
  required?: boolean;
  highlight?: boolean;
}) {
  const isResume = type === "RESUME";
  return (
    <div>
      <label className="block text-sm font-medium text-brand-navy mb-2">
        {ATTACHMENT_LABELS[type]}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <label
        className={`flex items-center gap-3 px-4 py-3 border border-dashed rounded-sm cursor-pointer hover:border-brand-accent hover:bg-brand-accent/5 transition-colors ${
          highlight && required && files.length === 0
            ? "border-red-400 bg-red-50/50 ring-2 ring-red-100"
            : "border-gray-300"
        }`}
      >
        <Upload className="w-4 h-4 text-brand-silver shrink-0" />
        <span className="text-sm text-brand-dark truncate">
          {files.length > 0
            ? isResume
              ? files[0].name
              : `${files.length} file(s) selected`
            : isResume
              ? "PDF, DOC, or DOCX — max 5MB"
              : "PDF, DOC, DOCX, JPG, PNG — max 5MB each"}
        </span>
        <input
          type="file"
          multiple={!isResume}
          accept={
            isResume
              ? ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              : ".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,image/*"
          }
          className="hidden"
          onChange={(e) => onChange(Array.from(e.target.files ?? []))}
        />
      </label>
      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between text-xs text-brand-dark bg-brand-gray/50 px-2 py-1 rounded-sm">
              <span className="truncate">{f.name}</span>
              <button
                type="button"
                className="text-red-500 ml-2 shrink-0"
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ResumeApplicationForm({
  jobId,
  jobTitle,
  jobDepartment,
}: {
  jobId?: string;
  jobTitle?: string;
  jobDepartment?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [activeField, setActiveField] = useState<FocusField | null>(null);

  const errorBannerRef = useRef<HTMLDivElement>(null);
  const fieldRefs = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    positionCategory: useRef<HTMLSelectElement>(null),
    position: useRef<HTMLInputElement>(null),
    educationSchool: useRef<HTMLInputElement>(null),
    photo: useRef<HTMLDivElement>(null),
    photoInput: useRef<HTMLInputElement>(null),
    attachments: useRef<HTMLDivElement>(null),
  };

  const focusField = (field: FocusField) => {
    setActiveField(field);
    window.setTimeout(() => {
      errorBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      const el =
        field === "photo"
          ? fieldRefs.photo.current
          : field === "attachments"
            ? fieldRefs.attachments.current
            : fieldRefs[field].current;
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (field !== "photo") {
        (el as HTMLInputElement | HTMLSelectElement | null)?.focus({ preventScroll: true });
      }
    }, 50);
  };

  const showError = (message: string, field?: FocusField | null) => {
    setError(message);
    if (field) focusField(field);
  };
  const [personal, setPersonal] = useState({
    name: "",
    email: "",
    phone: "",
    positionCategory: jobDepartment || "",
    position: jobTitle || "",
    dateOfBirth: "",
    address: "",
    summary: "",
    skills: "",
    languages: "",
    hasExperience: false,
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [education, setEducation] = useState<EducationEntry[]>([emptyEducation()]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([emptyExperience()]);
  const [attachments, setAttachments] = useState<Record<ResumeAttachmentType, File[]>>({
    RESUME: [],
    EMPLOYMENT_CERTIFICATE: [],
    EMPLOYMENT_CONTRACT: [],
    PAYSLIP: [],
    GRADUATION_CERTIFICATE: [],
    TRANSCRIPT: [],
    OTHER: [],
  });

  const clearPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handlePhotoSelect = (file: File) => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setActiveField(null);
  };

  const resetForm = () => {
    setPersonal({
      name: "", email: "", phone: "", positionCategory: jobDepartment || "", position: jobTitle || "", dateOfBirth: "", address: "",
      summary: "", skills: "", languages: "", hasExperience: false,
    });
    setEducation([emptyEducation()]);
    setExperience([emptyExperience()]);
    setAttachments({
      RESUME: [],
      EMPLOYMENT_CERTIFICATE: [], EMPLOYMENT_CONTRACT: [], PAYSLIP: [],
      GRADUATION_CERTIFICATE: [], TRANSCRIPT: [], OTHER: [],
    });
    clearPhoto();
  };

  const validateForm = (): { message: string; field: FocusField } | null => {
    if (!personal.name.trim()) {
      return { message: "Please enter your full name.", field: "name" };
    }
    if (!personal.email.trim()) {
      return { message: "Please enter your email address.", field: "email" };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email.trim())) {
      return { message: "Please enter a valid email address.", field: "email" };
    }
    if (!personal.positionCategory) {
      return { message: "Please select a department / role.", field: "positionCategory" };
    }
    if (attachments.RESUME.length === 0) {
      return { message: "Please upload your resume in PDF or Word format.", field: "attachments" };
    }
    if (personal.positionCategory === "CUSTOM" && !personal.position.trim()) {
      return { message: "You selected Other — please specify your desired position.", field: "position" };
    }
    const validEducation = education.filter((ed) => ed.school.trim());
    if (validEducation.length === 0) {
      return { message: "Please add at least one education entry (School / University in Section 3).", field: "educationSchool" };
    }
    if (attachments.GRADUATION_CERTIFICATE.length === 0) {
      return { message: "Please attach your graduation certificate.", field: "attachments" };
    }
    if (attachments.TRANSCRIPT.length === 0) {
      return { message: "Please attach your academic transcript / grade report.", field: "attachments" };
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setActiveField(null);

    const validationError = validateForm();
    if (validationError) {
      showError(validationError.message, validationError.field);
      setLoading(false);
      return;
    }

    const validEducation = education.filter((ed) => ed.school.trim());
    const validExperience = personal.hasExperience
      ? experience.filter((ex) => ex.company.trim() || ex.title.trim())
      : [];

    const payload = {
      ...personal,
      jobId,
      education: validEducation,
      experience: validExperience,
    };

    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));
    if (photoFile) formData.append("photo", photoFile);
    for (const [type, files] of Object.entries(attachments)) {
      for (const file of files) {
        formData.append(`file_${type}`, file);
      }
    }

    try {
      const res = await fetch("/api/careers/resume", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        const field = mapErrorToField(data.error || "", data.field);
        showError(data.error || "Submission failed", field);
        return;
      }
      setSuccess(true);
      resetForm();
    } catch {
      showError("Submission failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };
  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-sm p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-brand-navy mb-2">Resume Submitted</h3>
        <p className="text-brand-dark/70 text-sm mb-6">
          Thank you for applying. Our HR team will review your resume and supporting documents.
        </p>
        <Button type="button" variant="ghost" onClick={() => setSuccess(false)}>
          Submit Another Application
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6 w-full">
      <div className="bg-brand-navy text-white rounded-sm p-6 md:p-8">
        <p className="text-brand-accent text-xs tracking-widest uppercase mb-2">Careers at Dentium</p>
        <h2 className="text-2xl md:text-3xl font-semibold font-display">
          {jobTitle ? `Apply for ${jobTitle}` : "Write Your Resume"}
        </h2>
        <p className="text-white/70 text-sm mt-2 max-w-2xl">
          Fill in your education and work history below, then attach supporting documents (certificates, contracts, transcripts, etc.).
        </p>
      </div>

      {error && (
        <div ref={errorBannerRef} className="bg-red-50 text-red-700 text-sm p-3 rounded-sm border border-red-200">
          {error}
        </div>
      )}
      {/* Personal */}
      <div className={sectionClass}>
        <SectionTitle step="Section 1" title="Personal Information" />
        <div className="flex flex-col md:flex-row gap-6">
          <ProfilePhotoField
            preview={photoPreview}
            active={activeField === "photo"}
            sectionRef={fieldRefs.photo}
            inputRef={fieldRefs.photoInput}
            onSelect={handlePhotoSelect}
            onRemove={clearPhoto}
            onError={(message) => showError(message, "photo")}
          />
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1">Full Name *</label>
            <input
              ref={fieldRefs.name}
              className={fieldInputClass("name", activeField)}
              value={personal.name}
              onChange={(e) => { setPersonal({ ...personal, name: e.target.value }); setActiveField(null); }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1">Email *</label>
            <input
              ref={fieldRefs.email}
              type="email"
              className={fieldInputClass("email", activeField)}
              value={personal.email}
              onChange={(e) => { setPersonal({ ...personal, email: e.target.value }); setActiveField(null); }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1">Phone</label>
            <input type="tel" className={inputClass} value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1">Date of Birth</label>
            <input type="date" lang="en" className={inputClass} value={personal.dateOfBirth} onChange={(e) => setPersonal({ ...personal, dateOfBirth: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1">Department / Role *</label>
            <select
              ref={fieldRefs.positionCategory}
              className={fieldInputClass("positionCategory", activeField)}
              value={personal.positionCategory}
              disabled={Boolean(jobId)}
              onChange={(e) => {
                setPersonal({ ...personal, positionCategory: e.target.value, position: e.target.value === "CUSTOM" ? personal.position : "" });
                setActiveField(null);
              }}
            >
              <option value="">Select department / role</option>
              {JOB_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          {jobId && (
            <div className="sm:col-span-2 lg:col-span-3 text-sm text-brand-deep bg-brand-accent/10 border border-brand-accent/20 rounded-sm px-3 py-2">
              Selected opening: <strong>{jobTitle}</strong>
            </div>
          )}
          {personal.positionCategory === "CUSTOM" && (
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-brand-navy mb-1">Specify Position *</label>
              <input
                ref={fieldRefs.position}
                className={fieldInputClass("position", activeField)}
                placeholder="Enter your desired role"
                value={personal.position}
                onChange={(e) => { setPersonal({ ...personal, position: e.target.value }); setActiveField(null); }}
              />
            </div>
          )}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-brand-navy mb-1">Address</label>
            <input className={inputClass} value={personal.address} onChange={(e) => setPersonal({ ...personal, address: e.target.value })} />
          </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className={sectionClass}>
        <SectionTitle step="Section 2" title="Career Summary" subtitle="Brief introduction about yourself and career goals" />
        <textarea
          className={inputClass}
          rows={4}
          value={personal.summary}
          onChange={(e) => setPersonal({ ...personal, summary: e.target.value })}
          placeholder="Summarize your background, strengths, and why you want to join Dentium..."
        />
      </div>

      {/* Education */}
      <div className={sectionClass}>
        <div className="flex items-start justify-between gap-4">
          <SectionTitle step="Section 3" title="Education" subtitle="List your academic background from most recent" />
          <Button
            type="button"
            variant="ghost"
            className="shrink-0 text-sm"
            onClick={() => setEducation([...education, emptyEducation()])}
          >
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
        {education.map((ed, index) => (
          <div key={index} className="border border-gray-100 rounded-sm p-4 space-y-3 bg-brand-gray/20">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-brand-navy">Education #{index + 1}</span>
              {education.length > 1 && (
                <button type="button" onClick={() => setEducation(education.filter((_, i) => i !== index))} className="text-red-500 text-xs flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs font-medium text-brand-navy mb-1">School / University *</label>
                <input
                  ref={index === 0 ? fieldRefs.educationSchool : undefined}
                  className={index === 0 ? fieldInputClass("educationSchool", activeField) : inputClass}
                  value={ed.school}
                  onChange={(e) => {
                    const n = [...education];
                    n[index] = { ...ed, school: e.target.value };
                    setEducation(n);
                    if (index === 0) setActiveField(null);
                  }}
                />
              </div>              <div>
                <label className="block text-xs font-medium text-brand-navy mb-1">Degree</label>
                <input className={inputClass} placeholder="Bachelor's, Master's..." value={ed.degree} onChange={(e) => { const n = [...education]; n[index] = { ...ed, degree: e.target.value }; setEducation(n); }} />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-navy mb-1">Field of Study</label>
                <input className={inputClass} value={ed.field} onChange={(e) => { const n = [...education]; n[index] = { ...ed, field: e.target.value }; setEducation(n); }} />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-navy mb-1">Start</label>
                <input type="month" lang="en" className={inputClass} value={ed.startDate} onChange={(e) => { const n = [...education]; n[index] = { ...ed, startDate: e.target.value }; setEducation(n); }} />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-navy mb-1">End</label>
                <input type="month" lang="en" className={inputClass} value={ed.endDate} onChange={(e) => { const n = [...education]; n[index] = { ...ed, endDate: e.target.value }; setEducation(n); }} />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-medium text-brand-navy mb-1">Details (optional)</label>
                <textarea className={inputClass} rows={2} value={ed.description ?? ""} onChange={(e) => { const n = [...education]; n[index] = { ...ed, description: e.target.value }; setEducation(n); }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Experience */}
      <div className={sectionClass}>
        <SectionTitle step="Section 4" title="Work Experience" />
        <label className="flex items-center gap-2 text-sm text-brand-dark">
          <input
            type="checkbox"
            checked={personal.hasExperience}
            onChange={(e) => setPersonal({ ...personal, hasExperience: e.target.checked })}
          />
          I have previous work experience
        </label>

        {personal.hasExperience && (
          <>
            <div className="flex justify-end">
              <Button type="button" variant="ghost" className="text-sm" onClick={() => setExperience([...experience, emptyExperience()])}>
                <Plus className="w-4 h-4" /> Add Experience
              </Button>
            </div>
            {experience.map((ex, index) => (
              <div key={index} className="border border-gray-100 rounded-sm p-4 space-y-3 bg-brand-gray/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-brand-navy">Experience #{index + 1}</span>
                  {experience.length > 1 && (
                    <button type="button" onClick={() => setExperience(experience.filter((_, i) => i !== index))} className="text-red-500 text-xs flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-brand-navy mb-1">Company</label>
                    <input className={inputClass} value={ex.company} onChange={(e) => { const n = [...experience]; n[index] = { ...ex, company: e.target.value }; setExperience(n); }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-navy mb-1">Job Title</label>
                    <input className={inputClass} value={ex.title} onChange={(e) => { const n = [...experience]; n[index] = { ...ex, title: e.target.value }; setExperience(n); }} />
                  </div>
                  <div />
                  <div>
                    <label className="block text-xs font-medium text-brand-navy mb-1">Start Date</label>
                    <input type="month" lang="en" className={inputClass} value={ex.startDate} onChange={(e) => { const n = [...experience]; n[index] = { ...ex, startDate: e.target.value }; setExperience(n); }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-navy mb-1">End Date</label>
                    <input type="month" lang="en" className={inputClass} disabled={ex.current} value={ex.endDate} onChange={(e) => { const n = [...experience]; n[index] = { ...ex, endDate: e.target.value }; setExperience(n); }} />
                    <label className="flex items-center gap-2 mt-2 text-xs text-brand-silver">
                      <input type="checkbox" checked={ex.current} onChange={(e) => { const n = [...experience]; n[index] = { ...ex, current: e.target.checked, endDate: e.target.checked ? "" : ex.endDate }; setExperience(n); }} />
                      Currently working here
                    </label>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-xs font-medium text-brand-navy mb-1">Role & Responsibilities</label>
                    <textarea className={inputClass} rows={3} value={ex.description ?? ""} onChange={(e) => { const n = [...experience]; n[index] = { ...ex, description: e.target.value }; setExperience(n); }} placeholder="Describe your key responsibilities and achievements..." />
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Skills */}
      <div className={sectionClass}>
        <SectionTitle step="Section 5" title="Skills & Languages" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1">Skills</label>
            <textarea className={inputClass} rows={3} value={personal.skills} onChange={(e) => setPersonal({ ...personal, skills: e.target.value })} placeholder="e.g. Sales, CRM, Dental product knowledge..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1">Languages</label>
            <textarea className={inputClass} rows={3} value={personal.languages} onChange={(e) => setPersonal({ ...personal, languages: e.target.value })} placeholder="e.g. English (Fluent), Hindi (Native)..." />
          </div>
        </div>
      </div>

      {/* Attachments */}
      <div className={sectionClass}>
        <SectionTitle
          step="Section 6"
          title="Resume & Supporting Documents"
          subtitle="Upload your resume in PDF or Word format and attach supporting documents"
        />

        <div
          ref={fieldRefs.attachments}
          className={`flex gap-3 p-4 rounded-sm border text-sm ${
            activeField === "attachments"
              ? "bg-amber-50 border-amber-300 ring-2 ring-amber-100"
              : "bg-amber-50/60 border-amber-200"
          }`}
        >
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-brand-dark space-y-1.5">
            <p className="font-medium text-brand-navy">Tip — verify your background</p>
            <p>
              Please attach as many documents as possible to help us verify your qualifications.
              Even if you have no prior work experience, a <strong>graduation certificate</strong> and{" "}
              <strong>academic transcript</strong> are required.
            </p>
            <p className="text-brand-silver">
              Additional certificates (licenses, training, awards, etc.) are welcome and may speed up our review.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h4 className="text-sm font-semibold text-brand-navy mb-3">Resume / CV *</h4>
            <div className="max-w-xl">
              <FileUploadField
                type="RESUME"
                files={attachments.RESUME}
                onChange={(files) => {
                  setAttachments({ ...attachments, RESUME: files.slice(0, 1) });
                  setActiveField(null);
                }}
                required
                highlight={activeField === "attachments"}
              />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-brand-navy mb-3">Academic Documents</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {EDUCATION_ATTACHMENT_TYPES.map((type) => (
                <FileUploadField
                  key={type}
                  type={type}
                  files={attachments[type]}
                  onChange={(files) => {
                    setAttachments({ ...attachments, [type]: files });
                    setActiveField(null);
                  }}
                  required={type === "GRADUATION_CERTIFICATE" || type === "TRANSCRIPT"}
                  highlight={activeField === "attachments"}
                />
              ))}
            </div>
          </div>

          {personal.hasExperience && (
            <div>
              <h4 className="text-sm font-semibold text-brand-navy mb-3">Employment Documents (if applicable)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {EXPERIENCE_ATTACHMENT_TYPES.map((type) => (
                  <FileUploadField
                    key={type}
                    type={type}
                    files={attachments[type]}
                    onChange={(files) => setAttachments({ ...attachments, [type]: files })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Button type="submit" disabled={loading} size="lg" className="w-full md:w-auto">
        {loading ? "Submitting..." : "Submit Resume"}
      </Button>
    </form>
  );
}
