export function adminFileDownloadUrl(kind: "attachment" | "photo", id: string) {
  return kind === "photo"
    ? `/api/admin/resumes/${id}/photo`
    : `/api/admin/resumes/attachments/${id}`;
}
