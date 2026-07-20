export const EMPLOYMENT_TYPE_LABELS = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
} as const;

export type EmploymentTypeValue = keyof typeof EMPLOYMENT_TYPE_LABELS;

export type PublicJobPosting = {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string | null;
  employmentType: EmploymentTypeValue;
  summary: string | null;
  description: string;
  requirements: string | null;
};

export function splitJobLines(value: string | null | undefined) {
  return (value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
