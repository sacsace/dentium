"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { useCallback, useRef } from "react";
import { useAdminDialog } from "@/components/admin/ConfirmDialog";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Plus,
  Redo,
  Strikethrough,
  Table as TableIcon,
  Trash2,
  Underline as UnderlineIcon,
  Undo,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Verdana", value: "Verdana, sans-serif" },
];

const TEXT_COLORS = [
  "#000000", "#374151", "#1e3a5f", "#2563eb", "#059669",
  "#d97706", "#dc2626", "#7c3aed", "#acc90e",
];

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`p-1.5 rounded-sm transition-colors ${
        active
          ? "bg-brand-accent text-brand-navy"
          : "text-brand-navy hover:bg-brand-gray disabled:opacity-40"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-gray-200 mx-1" />;
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showAlert } = useAdminDialog();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-brand-deep underline" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      Image.configure({ inline: false, allowBase64: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "tiptap-content min-h-[280px] px-3 py-2 text-sm text-brand-dark focus:outline-none",
        "data-placeholder": placeholder ?? "Write content here...",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return;
      try {
        const url = await uploadImage(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch {
        void showAlert({ variant: "error", message: "Image upload failed." });
      }
    },
    [editor, showAlert]
  );

  if (!editor) return null;

  const inTable = editor.isActive("table");

  return (
    <div className="tiptap-editor border border-gray-200 rounded-sm overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-200 bg-brand-gray/40">
        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <select
          title="Font family"
          className="h-8 px-2 text-xs border border-gray-200 rounded-sm bg-white text-brand-navy max-w-[130px]"
          value={editor.getAttributes("textStyle").fontFamily ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            if (val) editor.chain().focus().setFontFamily(val).run();
            else editor.chain().focus().unsetFontFamily().run();
          }}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.label} value={f.value}>{f.label}</option>
          ))}
        </select>

        <div className="flex items-center gap-0.5 px-1">
          {TEXT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              title={`Text color ${color}`}
              className="w-5 h-5 rounded-sm border border-gray-200"
              style={{ backgroundColor: color }}
              onClick={() => editor.chain().focus().setColor(color).run()}
            />
          ))}
          <input
            type="color"
            title="Custom text color"
            className="w-6 h-6 p-0 border-0 cursor-pointer"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
        </div>

        <input
          type="color"
          title="Highlight color"
          className="w-6 h-6 p-0 border border-gray-200 rounded-sm cursor-pointer"
          onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
        />

        <ToolbarDivider />

        <ToolbarButton title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
          <AlignJustify className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton title="Insert link" active={editor.isActive("link")} onClick={setLink}>
          <Link2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Insert image" onClick={() => fileInputRef.current?.click()}>
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
            e.target.value = "";
          }}
        />

        <ToolbarDivider />

        <ToolbarButton
          title="Insert table"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          <TableIcon className="w-4 h-4" />
        </ToolbarButton>
        {inTable && (
          <>
            <ToolbarButton title="Add row" onClick={() => editor.chain().focus().addRowAfter().run()}>
              <Plus className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton title="Delete row" onClick={() => editor.chain().focus().deleteRow().run()}>
              <Minus className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton title="Add column" onClick={() => editor.chain().focus().addColumnAfter().run()}>
              <Plus className="w-3 h-3 rotate-90" />
            </ToolbarButton>
            <ToolbarButton title="Delete column" onClick={() => editor.chain().focus().deleteColumn().run()}>
              <Minus className="w-3 h-3 rotate-90" />
            </ToolbarButton>
            <ToolbarButton title="Delete table" onClick={() => editor.chain().focus().deleteTable().run()}>
              <Trash2 className="w-4 h-4" />
            </ToolbarButton>
          </>
        )}
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
