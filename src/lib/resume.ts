export type EducationEntry = {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description?: string;
};

export type ExperienceEntry = {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description?: string;
};

export type ResumePayload = {
  name: string;
  email: string;
  phone?: string;
  positionCategory?: string;
  position?: string;
  dateOfBirth?: string;
  address?: string;
  summary?: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills?: string;
  languages?: string;
  hasExperience: boolean;
};

export const RESUME_ATTACHMENT_TYPES = [
  "EMPLOYMENT_CERTIFICATE",
  "EMPLOYMENT_CONTRACT",
  "PAYSLIP",
  "GRADUATION_CERTIFICATE",
  "TRANSCRIPT",
  "OTHER",
] as const;

export type ResumeAttachmentType = (typeof RESUME_ATTACHMENT_TYPES)[number];

export const ATTACHMENT_LABELS: Record<ResumeAttachmentType, string> = {
  EMPLOYMENT_CERTIFICATE: "Previous Employment Certificate",
  EMPLOYMENT_CONTRACT: "Previous Employment Contract",
  PAYSLIP: "Previous Payslip",
  GRADUATION_CERTIFICATE: "Graduation Certificate",
  TRANSCRIPT: "Academic Transcript / Grade Report",
  OTHER: "Other Certificates",
};

export const EXPERIENCE_ATTACHMENT_TYPES: ResumeAttachmentType[] = [
  "EMPLOYMENT_CERTIFICATE",
  "EMPLOYMENT_CONTRACT",
  "PAYSLIP",
];

export const EDUCATION_ATTACHMENT_TYPES: ResumeAttachmentType[] = [
  "GRADUATION_CERTIFICATE",
  "TRANSCRIPT",
  "OTHER",
];

export function emptyEducation(): EducationEntry {
  return { school: "", degree: "", field: "", startDate: "", endDate: "", description: "" };
}

export function emptyExperience(): ExperienceEntry {
  return { company: "", title: "", startDate: "", endDate: "", current: false, description: "" };
}

export type ExperienceFilter = "ALL" | "FRESHER" | "EXPERIENCED";

export const JOB_CATEGORIES = [
  { value: "SALES", label: "Sales" },
  { value: "MARKETING", label: "Marketing" },
  { value: "HR", label: "HR" },
  { value: "ADMIN", label: "Admin" },
  { value: "ACCOUNTING", label: "Accounting" },
  { value: "LOGISTICS", label: "Logistics" },
  { value: "INVENTORY", label: "Inventory Management" },
  { value: "CUSTOM", label: "Other (specify)" },
] as const;

export type JobCategoryValue = (typeof JOB_CATEGORIES)[number]["value"];

export function getJobCategoryLabel(value: string | null | undefined): string {
  if (!value) return "—";
  const found = JOB_CATEGORIES.find((c) => c.value === value);
  return found?.label ?? value;
}

export function formatAppliedPosition(
  category: string | null | undefined,
  customPosition: string | null | undefined
): string {
  if (category === "CUSTOM" && customPosition?.trim()) return customPosition.trim();
  const label = getJobCategoryLabel(category);
  if (label !== "—") return label;
  return customPosition?.trim() || "—";
}

export type ResumeSearchable = {
  name: string;
  email: string;
  phone?: string | null;
  positionCategory?: string | null;
  position?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  summary?: string | null;
  skills?: string | null;
  languages?: string | null;
  adminNotes?: string | null;
  status?: string;
  hasExperience: boolean;
  education?: EducationEntry[] | unknown;
  experience?: ExperienceEntry[] | unknown;
  attachments?: { fileName: string; type?: string }[];
};

function asEducationList(value: unknown): EducationEntry[] {
  return Array.isArray(value) ? (value as EducationEntry[]) : [];
}

function asExperienceList(value: unknown): ExperienceEntry[] {
  return Array.isArray(value) ? (value as ExperienceEntry[]) : [];
}

export function buildResumeSearchHaystack(resume: ResumeSearchable): string {
  const parts: string[] = [
    resume.name,
    resume.email,
    resume.phone ?? "",
    resume.positionCategory ?? "",
    getJobCategoryLabel(resume.positionCategory),
    resume.position ?? "",
    resume.dateOfBirth ?? "",
    resume.address ?? "",
    resume.summary ?? "",
    resume.skills ?? "",
    resume.languages ?? "",
    resume.adminNotes ?? "",
    resume.status ?? "",
    resume.hasExperience ? "experienced career professional" : "fresher entry level newcomer",
  ];

  for (const ed of asEducationList(resume.education)) {
    parts.push(ed.school, ed.degree, ed.field, ed.description ?? "", ed.startDate, ed.endDate);
  }

  for (const ex of asExperienceList(resume.experience)) {
    parts.push(ex.company, ex.title, ex.description ?? "", ex.startDate, ex.endDate);
  }

  for (const att of resume.attachments ?? []) {
    parts.push(att.fileName, att.type ?? "");
  }

  return parts.join(" ").toLowerCase();
}

export function resumeMatchesKeyword(resume: ResumeSearchable, query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;
  const haystack = buildResumeSearchHaystack(resume);
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  return tokens.every((token) => haystack.includes(token));
}

export function resumeMatchesExperienceFilter(
  resume: ResumeSearchable,
  filter: ExperienceFilter
): boolean {
  if (filter === "ALL") return true;
  const hasWork =
    resume.hasExperience ||
    asExperienceList(resume.experience).some((ex) => ex.company.trim() || ex.title.trim());
  if (filter === "EXPERIENCED") return hasWork;
  return !hasWork;
}
