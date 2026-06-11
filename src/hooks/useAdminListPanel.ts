"use client";

import { useCallback, useState } from "react";
import type { AdminPanelMode } from "@/lib/admin-panel";
import { handleAdminBreadcrumbNavigate } from "@/lib/admin-panel";

export function useAdminListPanel<T extends { id: string }>() {
  const [panelMode, setPanelMode] = useState<AdminPanelMode>(null);
  const [selected, setSelected] = useState<T | null>(null);

  const closePanel = useCallback(() => {
    setPanelMode(null);
    setSelected(null);
  }, []);

  const openView = useCallback((item: T) => {
    setPanelMode("view");
    setSelected(item);
  }, []);

  const openEdit = useCallback(() => {
    if (!selected) return;
    setPanelMode("edit");
  }, [selected]);

  const openCreate = useCallback(() => {
    setPanelMode("create");
    setSelected(null);
  }, []);

  const backToView = useCallback(() => {
    setPanelMode("view");
  }, []);

  const cancelForm = useCallback(() => {
    if (panelMode === "edit" && selected) {
      backToView();
      return;
    }
    closePanel();
  }, [panelMode, selected, backToView, closePanel]);

  const handleBreadcrumbNavigate = useCallback(
    (id: string) => {
      handleAdminBreadcrumbNavigate(id, panelMode, closePanel, backToView);
    },
    [panelMode, closePanel, backToView]
  );

  const showSidePanel = panelMode !== null;
  const activeRowId = selected?.id ?? null;

  return {
    panelMode,
    setPanelMode,
    selected,
    setSelected,
    closePanel,
    openView,
    openEdit,
    openCreate,
    backToView,
    cancelForm,
    handleBreadcrumbNavigate,
    showSidePanel,
    activeRowId,
  };
}
