"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { FileText, Layers, Newspaper, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/admin/DataTable";
import { AdminInlineForm, FormField, inputClass } from "@/components/admin/AdminForm";
import { AdminDetailPanel, AdminPageHeader, AdminPanelBreadcrumb } from "@/components/admin/AdminPageHeader";
import { DetailField } from "@/components/admin/AdminDetailFields";
import { AdminListDetailGrid } from "@/components/admin/AdminListDetailGrid";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FeaturedImageField } from "@/components/admin/ImageUploadField";
import { useAdminListPanel } from "@/hooks/useAdminListPanel";
import { ADMIN_PANEL_CLASS, buildAdminBreadcrumbItems } from "@/lib/admin-panel";
import { cn } from "@/lib/utils";
import {
  getPostStatusLabel,
  POST_STATUS_ACTIVE,
  POST_STATUS_INACTIVE,
  postStatusToFormValue,
} from "@/lib/post-status";

const RichTextEditor = dynamic(
  () => import("@/components/admin/RichTextEditor").then((m) => m.RichTextEditor),
  { ssr: false, loading: () => <div className="h-[320px] border border-gray-200 rounded-sm bg-brand-gray/30 animate-pulse" /> }
);

interface Post {
  id: string;
  title: string;
  type: string;
  status: string;
  isFeatured: boolean;
}

interface PostDetail extends Post {
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  tags: string[];
  isPopular: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
}

const EMPTY_FORM = {
  title: "", excerpt: "", content: "", type: "BLOG", status: POST_STATUS_ACTIVE,
  featuredImage: "", tags: "", isFeatured: false, isPopular: false,
  seoTitle: "", seoDescription: "",
};

const TYPE_LABELS: Record<string, string> = {
  BLOG: "Blog",
  NEWS: "News",
};

function postToForm(data: PostDetail) {
  return {
    title: data.title ?? "",
    excerpt: data.excerpt ?? "",
    content: data.content ?? "",
    type: data.type ?? "BLOG",
    status: postStatusToFormValue(data.status ?? POST_STATUS_INACTIVE),
    featuredImage: data.featuredImage ?? "",
    tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
    isFeatured: data.isFeatured ?? false,
    isPopular: data.isPopular ?? false,
    seoTitle: data.seoTitle ?? "",
    seoDescription: data.seoDescription ?? "",
  };
}

function PostDetailView({ item }: { item: Post }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailField label="Type">{TYPE_LABELS[item.type] ?? item.type}</DetailField>
        <DetailField label="Status">{getPostStatusLabel(item.status)}</DetailField>
        <DetailField label="Featured">{item.isFeatured ? "Yes" : "No"}</DetailField>
      </div>
    </div>
  );
}

function PostFormFields({
  form,
  setForm,
  formLoading,
  editorKey,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  formLoading: boolean;
  editorKey: number;
}) {
  return (
    <>
      <FormField label="Title">
        <input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </FormField>
      <FormField label="Excerpt">
        <textarea className={inputClass} rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
      </FormField>
      <FormField label="Content">
        {formLoading ? (
          <div className="h-[320px] border border-gray-200 rounded-sm bg-brand-gray/30 animate-pulse" />
        ) : (
          <RichTextEditor
            key={editorKey}
            value={form.content}
            onChange={(content) => setForm((prev) => ({ ...prev, content }))}
            placeholder="Write your blog content..."
          />
        )}
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Type">
          <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="BLOG">Blog</option>
            <option value="NEWS">News</option>
          </select>
        </FormField>
        <FormField label="Status">
          <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value={POST_STATUS_ACTIVE}>Active</option>
            <option value={POST_STATUS_INACTIVE}>Inactive</option>
          </select>
        </FormField>
      </div>
      <FormField label="Featured Image">
        <FeaturedImageField
          value={form.featuredImage}
          onChange={(featuredImage) => setForm((prev) => ({ ...prev, featuredImage }))}
        />
        <p className="text-xs text-brand-silver mt-1">
          Used on blog cards. If empty, the first image in content is used automatically.
        </p>
      </FormField>
      <FormField label="Tags (comma separated)">
        <input className={inputClass} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
      </FormField>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({ ...form, isPopular: e.target.checked })} /> Popular
        </label>
      </div>
      <FormField label="SEO Title">
        <input className={inputClass} value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
      </FormField>
      <FormField label="SEO Description">
        <textarea className={inputClass} rows={2} value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
      </FormField>
    </>
  );
}

async function fetchPostDetail(id: string): Promise<PostDetail | null> {
  const res = await fetch(`/api/admin/posts/${id}`);
  const data = await res.json();
  if (!res.ok) return null;
  return data;
}

type TypeFilter = "all" | "BLOG" | "NEWS";

const TYPE_TABS: { key: TypeFilter; label: string; icon: typeof Layers }[] = [
  { key: "all", label: "All", icon: Layers },
  { key: "BLOG", label: "Blog", icon: FileText },
  { key: "NEWS", label: "News", icon: Newspaper },
];

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editorKey, setEditorKey] = useState(0);
  const { confirm, alert } = useConfirmDialog();
  const panel = useAdminListPanel<Post>();

  const fetchData = async () => {
    const res = await fetch("/api/admin/posts");
    setPosts(await res.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPosts = useMemo(() => {
    if (typeFilter === "all") return posts;
    return posts.filter((post) => post.type === typeFilter);
  }, [posts, typeFilter]);

  const typeCounts = useMemo(
    () => ({
      all: posts.length,
      BLOG: posts.filter((post) => post.type === "BLOG").length,
      NEWS: posts.filter((post) => post.type === "NEWS").length,
    }),
    [posts]
  );

  const openCreate = () => {
    setForm({
      ...EMPTY_FORM,
      type: typeFilter === "NEWS" ? "NEWS" : "BLOG",
    });
    setFormLoading(false);
    setEditorKey((k) => k + 1);
    panel.openCreate();
  };

  const openEditFromDetail = async () => {
    if (!panel.selected) return;
    setFormLoading(true);
    panel.openEdit();
    try {
      const data = await fetchPostDetail(panel.selected.id);
      if (data) {
        setForm(postToForm(data));
        setEditorKey((k) => k + 1);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const editing = panel.panelMode === "edit" ? panel.selected : null;
    const payload = { ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
    const url = editing ? `/api/admin/posts/${editing.id}` : "/api/admin/posts";
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      await alert({ variant: "error", message: data.error || "Failed to save post" });
      return;
    }

    const saved = await res.json();
    await fetchData();

    if (panel.panelMode === "edit") {
      panel.setSelected({
        id: saved.id ?? editing!.id,
        title: saved.title ?? form.title,
        type: saved.type ?? form.type,
        status: saved.status ?? form.status,
        isFeatured: saved.isFeatured ?? form.isFeatured,
      });
      panel.backToView();
      return;
    }

    panel.closePanel();
  };

  const handleDelete = async (post: Post) => {
    const ok = await confirm({
      title: "Delete post",
      message: `"${post.title}" will be permanently deleted. This action cannot be undone.`,
    });
    if (!ok) return;
    await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
    if (panel.selected?.id === post.id) panel.closePanel();
    fetchData();
  };

  const itemLabel = panel.selected?.title ?? "Details";
  const breadcrumbItems = buildAdminBreadcrumbItems(
    "Blog / News",
    panel.panelMode,
    panel.panelMode !== "create" ? itemLabel : undefined,
    "Add Post"
  );

  return (
    <div>
      <AdminPageHeader
        title="Blog / News"
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add Post
          </Button>
        }
      />

      <div className="flex border-b border-gray-200 mb-4">
        {TYPE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = typeFilter === tab.key;
          const count = typeCounts[tab.key];

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTypeFilter(tab.key)}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                isActive
                  ? "border-brand-accent text-brand-navy"
                  : "border-transparent text-brand-silver hover:text-brand-navy"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={cn("text-xs tabular-nums", isActive ? "text-brand-deep" : "text-brand-silver/80")}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      <AdminListDetailGrid
        showSidePanel={panel.showSidePanel}
        list={
          <DataTable
            columns={[
              { key: "title", label: "Title" },
              ...(typeFilter === "all"
                ? [{ key: "type" as const, label: "Type", render: (p: Post) => TYPE_LABELS[p.type] ?? p.type }]
                : []),
              {
                key: "status",
                label: "Status",
                render: (p) => (
                  <span
                    className={cn(
                      "inline-block px-2 py-0.5 rounded text-xs font-medium",
                      p.status === POST_STATUS_ACTIVE
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {getPostStatusLabel(p.status)}
                  </span>
                ),
              },
              { key: "isFeatured", label: "Featured", render: (p) => (p.isFeatured ? "Yes" : "No") },
            ]}
            data={filteredPosts}
            onEdit={panel.openView}
            onDelete={handleDelete}
            selectedRowId={panel.activeRowId}
          />
        }
        panel={
          <>
            {panel.panelMode === "view" && panel.selected && (
              <AdminDetailPanel
                title={panel.selected.title}
                breadcrumb={
                  <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />
                }
                headerAction={
                  <Button type="button" size="sm" variant="secondary" onClick={openEditFromDetail}>
                    Edit
                  </Button>
                }
                onClose={panel.closePanel}
                className={ADMIN_PANEL_CLASS}
              >
                <PostDetailView item={panel.selected} />
              </AdminDetailPanel>
            )}

            {panel.panelMode === "edit" && panel.selected && (
              <AdminInlineForm
                title="Edit Post"
                breadcrumb={
                  <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />
                }
                cancelLabel="Back to details"
                onSubmit={handleSubmit}
                onCancel={panel.cancelForm}
                loading={loading}
                className={ADMIN_PANEL_CLASS}
              >
                <PostFormFields form={form} setForm={setForm} formLoading={formLoading} editorKey={editorKey} />
              </AdminInlineForm>
            )}

            {panel.panelMode === "create" && (
              <AdminInlineForm
                title="Add Post"
                breadcrumb={
                  <AdminPanelBreadcrumb items={breadcrumbItems} onNavigate={panel.handleBreadcrumbNavigate} />
                }
                onSubmit={handleSubmit}
                onCancel={panel.cancelForm}
                loading={loading}
                className={ADMIN_PANEL_CLASS}
              >
                <PostFormFields form={form} setForm={setForm} formLoading={false} editorKey={editorKey} />
              </AdminInlineForm>
            )}
          </>
        }
      />

    </div>
  );
}
