export type AdminPanelMode = "view" | "edit" | "create" | null;

export type AdminBreadcrumbItem = { id: string; label: string };

export function buildAdminBreadcrumbItems(
  listLabel: string,
  mode: AdminPanelMode,
  itemLabel?: string,
  createLabel = "Add"
): AdminBreadcrumbItem[] {
  const items: AdminBreadcrumbItem[] = [{ id: "list", label: listLabel }];

  if (mode === "create") {
    items.push({ id: "create", label: createLabel });
    return items;
  }

  if (itemLabel) {
    items.push({ id: "view", label: itemLabel });
    if (mode === "edit") {
      items.push({ id: "edit", label: "Edit" });
    }
  }

  return items;
}

export function handleAdminBreadcrumbNavigate(
  id: string,
  mode: AdminPanelMode,
  onClose: () => void,
  onBackToView: () => void
) {
  if (id === "list") {
    onClose();
    return;
  }
  if (id === "view" && mode === "edit") {
    onBackToView();
  }
}

export const ADMIN_PANEL_CLASS = "xl:sticky xl:top-6 xl:self-start";
