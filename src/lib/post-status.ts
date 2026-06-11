export const POST_STATUS_ACTIVE = "PUBLISHED" as const;
export const POST_STATUS_INACTIVE = "DRAFT" as const;

export type PostStatusValue = typeof POST_STATUS_ACTIVE | typeof POST_STATUS_INACTIVE;

export function isPostActive(status: string): boolean {
  return status === POST_STATUS_ACTIVE;
}

export function getPostStatusLabel(status: string): string {
  return isPostActive(status) ? "Active" : "Inactive";
}

export function postStatusToFormValue(status: string): PostStatusValue {
  return isPostActive(status) ? POST_STATUS_ACTIVE : POST_STATUS_INACTIVE;
}

export function normalizePostStatus(status: unknown): PostStatusValue {
  if (status === POST_STATUS_ACTIVE || status === "ACTIVE") return POST_STATUS_ACTIVE;
  return POST_STATUS_INACTIVE;
}
