"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { mergeAttributes, Node } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import Youtube from "@tiptap/extension-youtube";
import MediaLibrary, { type MediaAsset, uploadMedia } from "./MediaLibrary";

type Props = {
  value: string;
  onChange: (html: string) => void;
  minHeight?: string;
};

const StyledContainer = Node.create({
  name: "styledContainer",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return {
      class: { default: null },
      style: { default: null },
      tag: { default: "div", rendered: false },
    };
  },
  parseHTML() {
    return [
      {
        tag: "div[class]",
        getAttrs: (element) => ({
          class: (element as HTMLElement).getAttribute("class"),
          style: (element as HTMLElement).getAttribute("style"),
          tag: "div",
        }),
      },
      {
        tag: "section[class]",
        getAttrs: (element) => ({
          class: (element as HTMLElement).getAttribute("class"),
          style: (element as HTMLElement).getAttribute("style"),
          tag: "section",
        }),
      },
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    const tag = node.attrs.tag === "section" ? "section" : "div";
    const { tag: _tag, ...attrs } = HTMLAttributes;
    return [tag, mergeAttributes(attrs), 0];
  },
});

const BuilderImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        parseHTML: (element) =>
          element.getAttribute("data-width") || element.style.width || "100%",
        renderHTML: (attributes) => ({
          "data-width": attributes.width,
          style: `width: ${attributes.width}`,
        }),
      },
      align: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-align") || "center",
        renderHTML: (attributes) => ({ "data-align": attributes.align }),
      },
    };
  },
});

const BLOCKS = [
  {
    label: "Quran verse",
    description: "Arabic, translation and reference",
    html: '<div class="ayah-box"><p class="arabic">ٱلْعَرَبِيَّة</p><p class="transliteration">Transliteration</p><p class="translation">Translation of the verse.</p><p class="reference">Surah Name 1:1</p></div><p></p>',
  },
  {
    label: "Hadith",
    description: "Hadith text and source",
    html: '<div class="hadith-box"><p class="translation">The hadith text goes here.</p><p class="reference">Sahih al-Bukhari 0000</p></div><p></p>',
  },
  {
    label: "Dua",
    description: "Arabic, transliteration and meaning",
    html: '<div class="dua-box"><p class="arabic">ٱلدُّعَاء</p><p class="transliteration">Transliteration</p><p class="translation">Meaning of the dua.</p></div><p></p>',
  },
  {
    label: "Key takeaway",
    description: "Highlighted summary card",
    html: '<div class="info-box"><h3>Key takeaway</h3><p>Write the most important point here.</p></div><p></p>',
  },
  {
    label: "Reflection",
    description: "Gentle reflective prompt",
    html: '<div class="hook-intro"><h3>Pause and reflect</h3><p>Write a reflective question or gentle reminder here.</p></div><p></p>',
  },
  {
    label: "Step",
    description: "Numbered practical action",
    html: '<div class="step-card"><p class="step-num">1</p><div class="step-content"><h3>Step title</h3><p>Explain what to do.</p></div></div><p></p>',
  },
];

const FONT_OPTIONS = [
  ["", "Default"],
  ["Georgia, serif", "Classic serif"],
  ["Arial, sans-serif", "Clean sans"],
  ["'Trebuchet MS', sans-serif", "Friendly sans"],
  ["'Courier New', monospace", "Monospace"],
  ["Amiri, serif", "Arabic / Amiri"],
] as const;

export default function RichTextEditor({ value, onChange, minHeight = "620px" }: Props) {
  const [mode, setMode] = useState<"visual" | "html" | "preview">("visual");
  const [source, setSource] = useState(value || "<p></p>");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const sourceRef = useRef(source);
  sourceRef.current = source;

  const editor = useEditor({
    immediatelyRender: false,
    content: value || "<p></p>",
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      TextStyleKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: "Start writing your article… Use the toolbar or the Add block menu above.",
      }),
      BuilderImage.configure({ inline: false, allowBase64: false }),
      TableKit.configure({
        table: { resizable: true, HTMLAttributes: { class: "builder-table" } },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: { class: "builder-youtube" },
      }),
      StyledContainer,
    ],
    editorProps: {
      attributes: {
        class: "prose builder-prose max-w-none focus:outline-none",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor: current }) => {
      const html = current.getHTML();
      setSource(html);
      onChange(html);
    },
  });

  useEffect(() => {
    if (mode !== "preview") return;
    const timer = setTimeout(async () => {
      setPreviewing(true);
      try {
        const response = await fetch("/api/admin/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ format: "html", body: sourceRef.current }),
        });
        const data = await response.json();
        if (data.ok) setPreviewHtml(data.html);
      } finally {
        setPreviewing(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [mode, source]);

  const selectMode = useCallback(
    (next: "visual" | "html" | "preview") => {
      if (next === "visual" && mode === "html" && editor) {
        editor.commands.setContent(sourceRef.current || "<p></p>", { emitUpdate: false });
        const normalized = editor.getHTML();
        setSource(normalized);
        onChange(normalized);
      }
      setMode(next);
    },
    [editor, mode, onChange]
  );

  const insertImage = useCallback(
    (asset: MediaAsset) => {
      if (!editor) return;
      const defaultAlt = asset.name.replace(/[-_]+/g, " ").replace(/\.[^.]+$/, "");
      editor
        .chain()
        .focus()
        .setImage({ src: asset.url, alt: defaultAlt, title: defaultAlt })
        .run();
    },
    [editor]
  );

  const uploadAndInsert = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setUploading(true);
      setUploadError("");
      try {
        insertImage(await uploadMedia(file));
      } catch (error) {
        setUploadError((error as Error).message);
      } finally {
        setUploading(false);
      }
    },
    [insertImage]
  );

  const words = useMemo(
    () =>
      source
        .replace(/<[^>]+>/g, " ")
        .replace(/&[^;]+;/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length,
    [source]
  );

  function setLink() {
    if (!editor) return;
    const current = editor.getAttributes("link").href || "";
    const href = prompt("Link URL", current || "https://");
    if (href === null) return;
    if (!href.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
  }

  function addYoutube() {
    if (!editor) return;
    const url = prompt("Paste a YouTube video URL");
    if (url?.trim()) editor.commands.setYoutubeVideo({ src: url.trim(), width: 720, height: 405 });
  }

  function editImageAlt() {
    if (!editor?.isActive("image")) return;
    const current = editor.getAttributes("image").alt || "";
    const alt = prompt("Describe this image for accessibility", current);
    if (alt !== null) editor.chain().focus().updateAttributes("image", { alt }).run();
  }

  if (!editor) {
    return <div className="rounded-xl border border-cream-200 bg-white p-12 text-center text-sm text-ink-400">Loading editor…</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-cream-200 bg-white shadow-sm">
      <div className="border-b border-cream-200 bg-cream-50/80">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-200 px-3 py-2">
          <div className="flex rounded-lg border border-cream-200 bg-white p-0.5">
            {(["visual", "html", "preview"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => selectMode(item)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize ${
                  mode === item ? "bg-emerald-100 text-emerald-800" : "text-ink-400 hover:text-ink-700"
                }`}
              >
                {item === "html" ? "HTML" : item}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-ink-400">
            {uploading && <span className="text-emerald-700">Uploading image…</span>}
            <span>{words} words · ~{Math.max(1, Math.round(words / 200))} min</span>
          </div>
        </div>

        {mode === "visual" && (
          <div className="space-y-2 p-2">
            <div className="flex flex-wrap items-center gap-1">
              <select
                aria-label="Text style"
                value={
                  editor.isActive("heading", { level: 2 })
                    ? "h2"
                    : editor.isActive("heading", { level: 3 })
                      ? "h3"
                      : editor.isActive("heading", { level: 4 })
                        ? "h4"
                        : "p"
                }
                onChange={(event) => {
                  const value = event.target.value;
                  if (value === "p") editor.chain().focus().setParagraph().run();
                  else editor.chain().focus().toggleHeading({ level: Number(value.slice(1)) as 2 | 3 | 4 }).run();
                }}
                className="builder-select"
              >
                <option value="p">Paragraph</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
              </select>

              <select
                aria-label="Font family"
                value={editor.getAttributes("textStyle").fontFamily || ""}
                onChange={(event) => {
                  if (event.target.value) editor.chain().focus().setFontFamily(event.target.value).run();
                  else editor.chain().focus().unsetFontFamily().run();
                }}
                className="builder-select max-w-36"
              >
                {FONT_OPTIONS.map(([value, label]) => <option key={label} value={value}>{label}</option>)}
              </select>

              <select
                aria-label="Font size"
                value={editor.getAttributes("textStyle").fontSize || ""}
                onChange={(event) => {
                  if (event.target.value) editor.chain().focus().setFontSize(event.target.value).run();
                  else editor.chain().focus().unsetFontSize().run();
                }}
                className="builder-select"
              >
                <option value="">Size</option>
                {[14, 16, 18, 20, 24, 30, 36, 48].map((size) => <option key={size} value={`${size}px`}>{size}</option>)}
              </select>

              <Divider />
              <Tool active={editor.isActive("bold")} label="Bold" onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></Tool>
              <Tool active={editor.isActive("italic")} label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></Tool>
              <Tool active={editor.isActive("underline")} label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()}><span className="underline">U</span></Tool>
              <Tool active={editor.isActive("strike")} label="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()}><span className="line-through">S</span></Tool>
              <Tool active={editor.isActive("link")} label="Add or edit link" onClick={setLink}>Link</Tool>
              {editor.isActive("link") && <Tool label="Remove link" onClick={() => editor.chain().focus().unsetLink().run()}>Unlink</Tool>}

              <Divider />
              <label className="builder-color" title="Text color">
                <span>A</span>
                <input type="color" value={editor.getAttributes("textStyle").color || "#24352d"} onChange={(event) => editor.chain().focus().setColor(event.target.value).run()} />
              </label>
              <label className="builder-color" title="Highlight color">
                <span className="rounded bg-gold-300 px-0.5">A</span>
                <input type="color" value={editor.getAttributes("textStyle").backgroundColor || "#f4e4a6"} onChange={(event) => editor.chain().focus().setBackgroundColor(event.target.value).run()} />
              </label>
              <Tool label="Clear text formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>Clear</Tool>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <Tool active={editor.isActive({ textAlign: "left" })} label="Align left" onClick={() => editor.chain().focus().setTextAlign("left").run()}>Left</Tool>
              <Tool active={editor.isActive({ textAlign: "center" })} label="Align center" onClick={() => editor.chain().focus().setTextAlign("center").run()}>Center</Tool>
              <Tool active={editor.isActive({ textAlign: "right" })} label="Align right" onClick={() => editor.chain().focus().setTextAlign("right").run()}>Right</Tool>
              <Tool active={editor.isActive({ textAlign: "justify" })} label="Justify" onClick={() => editor.chain().focus().setTextAlign("justify").run()}>Justify</Tool>
              <select
                aria-label="Line height"
                value={editor.getAttributes("textStyle").lineHeight || ""}
                onChange={(event) => {
                  if (event.target.value) editor.chain().focus().setLineHeight(event.target.value).run();
                  else editor.chain().focus().unsetLineHeight().run();
                }}
                className="builder-select"
              >
                <option value="">Line height</option>
                <option value="1.4">Compact</option>
                <option value="1.6">Normal</option>
                <option value="1.8">Relaxed</option>
                <option value="2">Spacious</option>
              </select>

              <Divider />
              <Tool active={editor.isActive("bulletList")} label="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</Tool>
              <Tool active={editor.isActive("orderedList")} label="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</Tool>
              <Tool active={editor.isActive("blockquote")} label="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()}>Quote</Tool>
              <Tool label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</Tool>

              <Divider />
              <button type="button" onClick={() => setMediaOpen(true)} className="builder-primary-tool">＋ Image</button>
              <Tool label="Embed YouTube video" onClick={addYoutube}>YouTube</Tool>
              <Tool label="Insert table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Table</Tool>
              <select
                aria-label="Add designed block"
                defaultValue=""
                onChange={(event) => {
                  const block = BLOCKS.find((item) => item.label === event.target.value);
                  if (block) editor.chain().focus().insertContent(block.html).run();
                  event.target.value = "";
                }}
                className="builder-select border-emerald-300 text-emerald-800"
              >
                <option value="">＋ Add block</option>
                {BLOCKS.map((block) => <option key={block.label} value={block.label}>{block.label} — {block.description}</option>)}
              </select>

              <span className="ml-auto flex items-center gap-1">
                <Tool label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>↶</Tool>
                <Tool label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>↷</Tool>
              </span>
            </div>

            {editor.isActive("image") && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs">
                <strong className="text-emerald-900">Selected image</strong>
                <Tool label="Edit alternative text" onClick={editImageAlt}>Edit alt text</Tool>
                <select value={editor.getAttributes("image").width || "100%"} onChange={(event) => editor.chain().focus().updateAttributes("image", { width: event.target.value }).run()} className="builder-select">
                  <option value="100%">Full width</option>
                  <option value="75%">Large</option>
                  <option value="50%">Medium</option>
                  <option value="33.333%">Small</option>
                </select>
                {(["left", "center", "right"] as const).map((align) => (
                  <Tool key={align} active={editor.getAttributes("image").align === align} label={`Align image ${align}`} onClick={() => editor.chain().focus().updateAttributes("image", { align }).run()}>{align}</Tool>
                ))}
                <Tool label="Remove image" onClick={() => editor.chain().focus().deleteSelection().run()}>Remove</Tool>
              </div>
            )}

            {editor.isActive("table") && (
              <div className="flex flex-wrap items-center gap-1 rounded-lg border border-gold-300 bg-gold-300/10 px-3 py-2">
                <strong className="mr-2 text-xs text-emerald-900">Table</strong>
                <Tool label="Add row" onClick={() => editor.chain().focus().addRowAfter().run()}>＋ Row</Tool>
                <Tool label="Delete row" onClick={() => editor.chain().focus().deleteRow().run()}>− Row</Tool>
                <Tool label="Add column" onClick={() => editor.chain().focus().addColumnAfter().run()}>＋ Column</Tool>
                <Tool label="Delete column" onClick={() => editor.chain().focus().deleteColumn().run()}>− Column</Tool>
                <Tool label="Toggle header row" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>Header</Tool>
                <Tool label="Delete table" onClick={() => editor.chain().focus().deleteTable().run()}>Delete table</Tool>
              </div>
            )}
          </div>
        )}
      </div>

      {uploadError && <p role="alert" className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">{uploadError}</p>}

      {mode === "visual" && (
        <div
          className="builder-editor-canvas"
          style={{ minHeight }}
          onDragOver={(event) => {
            if (Array.from(event.dataTransfer.items).some((item) => item.type.startsWith("image/"))) event.preventDefault();
          }}
          onDrop={(event) => {
            const file = Array.from(event.dataTransfer.files).find((item) => item.type.startsWith("image/"));
            if (file) {
              event.preventDefault();
              void uploadAndInsert(file);
            }
          }}
          onPaste={(event) => {
            const file = Array.from(event.clipboardData.files).find((item) => item.type.startsWith("image/"));
            if (file) {
              event.preventDefault();
              void uploadAndInsert(file);
            }
          }}
        >
          <EditorContent editor={editor} />
        </div>
      )}

      {mode === "html" && (
        <textarea
          value={source}
          onChange={(event) => {
            setSource(event.target.value);
            onChange(event.target.value);
          }}
          spellCheck={false}
          className="w-full resize-y bg-[#17251f] p-5 font-mono text-sm leading-6 text-emerald-50 outline-none"
          style={{ minHeight }}
          aria-label="Article HTML source"
        />
      )}

      {mode === "preview" && (
        <div className="mx-auto max-w-3xl px-6 py-10" style={{ minHeight }}>
          {previewing && <p className="mb-3 text-xs text-ink-400">Sanitizing preview…</p>}
          {previewHtml ? (
            <div className="prose" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          ) : (
            <p className="text-sm text-ink-400">Nothing to preview yet.</p>
          )}
        </div>
      )}

      <MediaLibrary open={mediaOpen} onClose={() => setMediaOpen(false)} onSelect={insertImage} title="Insert an image" />
    </div>
  );
}

function Tool({
  children,
  label,
  onClick,
  active,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`builder-tool ${active ? "builder-tool-active" : ""}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden="true" className="mx-0.5 h-6 w-px bg-cream-300" />;
}
