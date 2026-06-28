"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Draft } from "@/lib/drafts";

export default function DraftEditor({
  draft,
  previewHtml,
}: {
  draft: Draft;
  previewHtml: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(draft.title);
  const [slug, setSlug] = useState(draft.slug);
  const [excerpt, setExcerpt] = useState(draft.excerpt || "");
  const [author, setAuthor] = useState(draft.author || "Nazia Firdous");
  const [categories, setCategories] = useState((draft.categories || []).join(", "));
  const [cover, setCover] = useState(draft.cover || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  function overrides() {
    return {
      title,
      slug,
      excerpt,
      author,
      cover: cover || null,
      categories: categories.split(",").map((s) => s.trim()).filter(Boolean),
    };
  }

  async function save() {
    setBusy(true);
    setMsg("");
    const res = await fetch(`/api/admin/drafts/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(overrides()),
    });
    setBusy(false);
    setMsg(res.ok ? "Saved." : "Save failed.");
    router.refresh();
  }

  async function publish() {
    if (!confirm("Publish this article to the live site?")) return;
    setBusy(true);
    setMsg("");
    const res = await fetch(`/api/admin/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: draft.id, ...overrides() }),
    });
    const data = await res.json();
    setBusy(false);
    if (res.ok && data.ok) {
      router.push(`/admin?published=${data.slug}`);
      router.refresh();
    } else {
      setMsg(data.error || "Publish failed.");
    }
  }

  async function remove() {
    if (!confirm("Delete this draft permanently?")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/drafts/${draft.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setMsg("Delete failed.");
    }
  }

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-2">
      {/* Editor */}
      <div className="space-y-4">
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} />
        </Field>
        <Field label="Slug (URL)">
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className={input} />
        </Field>
        <Field label="Excerpt">
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className={input}
          />
        </Field>
        <Field label="Author">
          <input value={author} onChange={(e) => setAuthor(e.target.value)} className={input} />
        </Field>
        <Field label="Topics (comma-separated)">
          <input
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            className={input}
          />
        </Field>
        <Field label="Cover image URL">
          <input value={cover} onChange={(e) => setCover(e.target.value)} className={input} />
        </Field>

        {msg && (
          <p
            role="status"
            aria-live="polite"
            className="text-sm font-medium text-emerald-700"
          >
            {msg}
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={publish}
            disabled={busy}
            className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            Approve &amp; publish
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="rounded-full border border-emerald-300 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
          >
            Save changes
          </button>
          <button
            onClick={remove}
            disabled={busy}
            className="rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Preview */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
          Preview
        </p>
        <div className="rounded-[var(--radius-card)] border border-cream-200 bg-white p-6">
          <h2 className="font-serif text-2xl font-semibold text-emerald-900">{title}</h2>
          <div
            className="prose mt-4 max-w-3xl"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      </div>
    </div>
  );
}

const input =
  "w-full rounded-lg border border-cream-200 px-3 py-2 text-base outline-none focus:border-emerald-400";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink-700">{label}</span>
      {children}
    </label>
  );
}
