"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/admin/DataTable";
import { AdminForm, FormField, inputClass } from "@/components/admin/AdminForm";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FeaturedImageField } from "@/components/admin/ImageUploadField";

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

const EMPTY_FORM = {
  title: "", excerpt: "", content: "", type: "BLOG", status: "DRAFT",
  featuredImage: "", tags: "", isFeatured: false, isPopular: false,
  seoTitle: "", seoDescription: "",
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editorKey, setEditorKey] = useState(0);
  const { confirm, ConfirmDialogHost } = useConfirmDialog();

  const fetchData = async () => {
    const res = await fetch("/api/admin/posts");
    setPosts(await res.json());
  };

  useEffect(() => { fetchData(); }, []);

  const openAddForm = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setEditorKey((k) => k + 1);
    setShowForm(true);
  };

  const openEditForm = async (post: Post) => {
    setEditing(post);
    setFormLoading(true);
    setShowForm(true);
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`);
      const data = await res.json();
      if (res.ok) {
        setForm({
          title: data.title ?? "",
          excerpt: data.excerpt ?? "",
          content: data.content ?? "",
          type: data.type ?? "BLOG",
          status: data.status ?? "DRAFT",
          featuredImage: data.featuredImage ?? "",
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
          isFeatured: data.isFeatured ?? false,
          isPopular: data.isPopular ?? false,
          seoTitle: data.seoTitle ?? "",
          seoDescription: data.seoDescription ?? "",
        });
        setEditorKey(data.id);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
    const url = editing ? `/api/admin/posts/${editing.id}` : "/api/admin/posts";
    const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setLoading(false);
    if (res.ok) {
      setShowForm(false);
      fetchData();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to save post");
    }
  };

  const handleDelete = async (post: Post) => {
    const ok = await confirm({
      title: "Delete post",
      message: `"${post.title}" will be permanently deleted. This action cannot be undone.`,
    });
    if (!ok) return;
    await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-brand-navy">Blog / News</h1>
        <Button onClick={openAddForm}><Plus className="w-4 h-4" /> Add Post</Button>
      </div>

      <DataTable
        columns={[
          { key: "title", label: "Title" },
          { key: "type", label: "Type" },
          { key: "status", label: "Status" },
          { key: "isFeatured", label: "Featured", render: (p) => p.isFeatured ? "Yes" : "No" },
        ]}
        data={posts}
        onEdit={openEditForm}
        onDelete={handleDelete}
      />

      {showForm && (
        <AdminForm
          title={editing ? "Edit Post" : "Add Post"}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          loading={loading}
          wide
        >
          <FormField label="Title"><input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Excerpt"><textarea className={inputClass} rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></FormField>
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
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
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
          <FormField label="Tags (comma separated)"><input className={inputClass} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></FormField>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({ ...form, isPopular: e.target.checked })} /> Popular</label>
          </div>
          <FormField label="SEO Title"><input className={inputClass} value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} /></FormField>
          <FormField label="SEO Description"><textarea className={inputClass} rows={2} value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} /></FormField>
        </AdminForm>
      )}
      <ConfirmDialogHost />
    </div>
  );
}
