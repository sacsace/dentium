export function refreshAdminNavBadges() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("admin:nav-badges-refresh"));
  }
}
