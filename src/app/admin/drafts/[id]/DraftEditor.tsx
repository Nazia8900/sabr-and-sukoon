"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Draft } from "@/lib/drafts";
import RichTextEditor from "@/components/admin/RichTextEditor";
import MediaLibrary, { type MediaAsset } from "@/components/admin/MediaLibrary";

const input =
  "w-full rounded-lg border border-cream-300 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export default function DraftEditor({ draft, previewHtml }: { draft: Draft; previewHtml: string }) {
  const router = useRouter();
  const [title, setTitle] = useState(draft.title);
  const [slug, setSlug] = useState(draft.slug);
  const [excerpt, setExcerpt] = useState(draft.excerpt || "");
  const [author, setAuthor] = useState(draft.author || "Nazia Firdous");
  const [categories, setCategories] = useState((draft.categories || []).join(", "));
  const [cover, setCover] = useState(draft.cover || "");
  const [body, setBody] = useState(previewHtml || "<p></p>");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ error?: boolean; text: string } | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);

  function values() {
    return {
      title,
      slug,
      excerpt,
      author,
      cover: cover || null,
      categories: categories.split(",").map((item) => item.trim()).filter(Boolean),
      contentHtml: body,
    };
  }

  async function save() {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/drafts/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values()),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Save failed.");
      setMessage({ text: "Draft changes saved." });
      router.refresh();
    } catch (error) {
      setMessage({ error: true, text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    if (!confirm("Publish this article to the live site?")) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draft.id, ...values() }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Publish failed.");
      router.push(`/admin/posts/${data.slug}`);
      router.refresh();
    } catch (error) {
      setMessage({ error: true, text: (error as Error).message });
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this automation draft permanently?")) return;
    setBusy(true);
    const response = await fetch(`/api/admin/drafts/${draft.id}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/admin/drafts");
      router.refresh();
    } else {
      setMessage({ error: true, text: "Delete failed." });
      setBusy(false);
    }
  }

  function chooseCover(asset: MediaAsset) {
    setCover(asset.url);
  }

  return (
    <div className="mt-6 pb-24">
      <div className="sticky top-0 z-30 -mx-4 mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-cream-200 bg-cream-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">Automation draft</p>
          <p className="text-sm text-ink-500">Review and visually edit everything before publishing.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void remove()} disabled={busy} className="admin-danger-button">Delete</button>
          <button type="button" onClick={() => void save()} disabled={busy} className="admin-secondary-button">Save changes</button>
          <button type="button" onClick={() => void publish()} disabled={busy} className="admin-primary-button">{busy ? "Working…" : "Approve & publish"}</button>
        </div>
      </div>

      {message && <p role="status" className={`mb-4 rounded-lg px-3 py-2 text-sm ${message.error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{message.text}</p>}

      <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full bg-transparent font-serif text-4xl font-semibold text-emerald-950 outline-none" placeholder="Article title" />

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <RichTextEditor value={body} onChange={setBody} />
        <aside className="space-y-4 xl:sticky xl:top-24">
          <Panel title="Article settings">
            <Field label="URL slug"><input value={slug} onChange={(event) => setSlug(event.target.value)} className={input} /></Field>
            <Field label="Author"><input value={author} onChange={(event) => setAuthor(event.target.value)} className={input} /></Field>
            <Field label="Topics"><input value={categories} onChange={(event) => setCategories(event.target.value)} className={input} placeholder="Comma separated" /></Field>
            <Field label="Excerpt"><textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} rows={5} maxLength={400} className={input} /></Field>
          </Panel>
          <Panel title="Cover image">
            {cover && <>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={cover} alt="Cover preview" className="mb-3 aspect-video w-full rounded-lg object-cover" /></>}
            <button type="button" onClick={() => setMediaOpen(true)} className="admin-secondary-button w-full">{cover ? "Replace cover" : "Upload or choose cover"}</button>
            <input value={cover} onChange={(event) => setCover(event.target.value)} className={`${input} mt-3`} placeholder="Or paste image URL" />
          </Panel>
        </aside>
      </div>

      <MediaLibrary open={mediaOpen} onClose={() => setMediaOpen(false)} onSelect={chooseCover} title="Choose a cover image" />
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-cream-200 bg-cream-50 p-4 shadow-sm"><h2 className="mb-4 font-serif font-semibold text-emerald-900">{title}</h2><div className="space-y-4">{children}</div></section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</span>{children}</label>;
}
