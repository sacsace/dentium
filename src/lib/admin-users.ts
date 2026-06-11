import type { SessionUser } from "@/lib/auth";

export const ROOT_USER_EMAIL = "root";

export type AssignableRole = "USER" | "ADMIN";

export function listUsersWhere(session: SessionUser) {
  if (session.role === "SUPER_ADMIN") return {};
  return {
    NOT: {
      OR: [{ role: "SUPER_ADMIN" as const }, { email: ROOT_USER_EMAIL }],
    },
  };
}

export function canManageUser(
  actor: SessionUser,
  target: { role: string; email: string }
) {
  if (actor.role === "SUPER_ADMIN") return true;
  if (target.role === "SUPER_ADMIN" || target.email === ROOT_USER_EMAIL) return false;
  return actor.role === "ADMIN";
}

export function assignableRoles(actor: SessionUser): AssignableRole[] {
  if (actor.role === "SUPER_ADMIN" || actor.role === "ADMIN") {
    return ["USER", "ADMIN"];
  }
  return [];
}

export function canAssignRole(actor: SessionUser, role: string) {
  return assignableRoles(actor).includes(role as AssignableRole);
}
