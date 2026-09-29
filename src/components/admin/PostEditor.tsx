"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import MediaLibrary, { type MediaAsset } from "./MediaLibrary";
import RichTextEditor from "./RichTextEditor";

export type EditorPost = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string | null;
  categories: string[];
  cover: string | null;
  status: "published" | "draft";
  format: "markdown" | "html";
  body: string;
};

type Props = {
  post: EditorPost;
  existingSlug?: string;
  knownTopics: string[];
};

type Recovery = {
  savedAt: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  publishedAt: string | null;
  categories: string;
  cover: string;
  body: string;
};

const input =
  "w-full rounded-lg border border-cream-300 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z0-9#]+;/g, " ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "");
}

function dateTimeValue(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function PostEditor({ post, existingSlug, knownTopics }: Props) {
  const router = useRouter();
  const isNew = !existingSlug;
  const initialHtml = useMemo(
    () =>
      post.format === "markdown"
        ? (marked.parse(post.body || "", { async: false }) as string)
        : post.body || "<p></p>",
    [post.body, post.format]
  );

  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [author, setAuthor] = useState(post.author);
  const [publishedAt, setPublishedAt] = useState(dateTimeValue(post.publishedAt));
  const [categories, setCategories] = useState(post.categories.join(", "));
  const [cover, setCover] = useState(post.cover || "");
  const [body, setBody] = useState(initialHtml);
  const [status, setStatus] = useState(post.status);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [recovery, setRecovery] = useState<Recovery | null>(null);

  const recoveryKey = `ss-editor-recovery:${existingSlug || "new"}`;

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(recoveryKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as Recovery;
      if (saved.body !== initialHtml || saved.title !== post.title) setRecovery(saved);
    } catch {
      localStorage.removeItem(recoveryKey);
    }
  }, [initialHtml, post.title, recoveryKey]);

  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => {
      const snapshot: Recovery = {
        savedAt: new Date().toISOString(),
        title,
        slug,
        excerpt,
        author,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
        categories,
        cover,
        body,
      };
      localStorage.setItem(recoveryKey, JSON.stringify(snapshot));
    }, 800);
    return () => clearTimeout(timer);
  }, [author, body, categories, cover, dirty, excerpt, publishedAt, recoveryKey, slug, title]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const change = useCallback(<T,>(setter: (value: T) => void, value: T) => {
    setter(value);
    setDirty(true);
    setMessage(null);
  }, []);

  const save = useCallback(
    async (nextStatus?: "published" | "draft") => {
      if (!title.trim()) {
        setMessage({ kind: "error", text: "Add a title before saving." });
        return;
      }
      if (!body.replace(/<[^>]+>/g, "").trim()) {
        setMessage({ kind: "error", text: "Write some article content before saving." });
        return;
      }

      setBusy(true);
      setMessage(null);
      const resolvedStatus = nextStatus || status;
      try {
        const response = await fetch(
          isNew ? "/api/admin/posts" : `/api/admin/posts/${encodeURIComponent(existingSlug)}`,
          {
            method: isNew ? "POST" : "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              slug,
              title,
              excerpt,
              author,
              categories: categories.split(",").map((item) => item.trim()).filter(Boolean),
              cover: cover.trim() || null,
              status: resolvedStatus,
              format: "html",
              body,
              publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
            }),
          }
        );
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.error || "Could not save the article.");

        setStatus(resolvedStatus);
        setDirty(false);
        localStorage.removeItem(recoveryKey);
        setRecovery(null);
        setMessage({
          kind: "ok",
          text: resolvedStatus === "published" ? "Published successfully." : "Draft saved successfully.",
        });
        if (isNew || data.slug !== existingSlug) router.replace(`/admin/posts/${data.slug}`);
        router.refresh();
      } catch (error) {
        setMessage({ kind: "error", text: (error as Error).message });
      } finally {
        setBusy(false);
      }
    }, [author, body, categories, cover, excerpt, existingSlug, isNew, publishedAt, recoveryKey, router, slug, status, title]
  );

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [save]);

  async function remove() {
    if (!existingSlug || !confirm("Delete this article? Migrated articles will be hidden rather than erased.")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/posts/${encodeURIComponent(existingSlug)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not delete article.");
      localStorage.removeItem(recoveryKey);
      setDirty(false);
      router.push("/admin/posts");
      router.refresh();
    } catch (error) {
      setMessage({ kind: "error", text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  function restoreRecovery() {
    if (!recovery) return;
    setTitle(recovery.title);
    setSlug(recovery.slug);
    setExcerpt(recovery.excerpt);
    setAuthor(recovery.author);
    setPublishedAt(dateTimeValue(recovery.publishedAt));
    setCategories(recovery.categories);
    setCover(recovery.cover);
    setBody(recovery.body);
    setDirty(true);
    setRecovery(null);
  }

  function chooseCover(asset: MediaAsset) {
    change(setCover, asset.url);
  }

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 -mx-4 mb-6 border-b border-cream-200 bg-cream-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/admin/posts" className="text-sm text-ink-500 hover:text-emerald-700">← All articles</Link>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-gold-300/30 text-gold-600"}`}>
              {status === "published" ? "Published" : "Draft"}
            </span>
            <span className={`text-xs ${dirty ? "text-gold-600" : "text-ink-400"}`}>
              {dirty ? "Unsaved changes" : "All changes saved"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {existingSlug && status === "published" && (
              <a href={`/blog/${existingSlug}`} target="_blank" rel="noopener noreferrer" className="admin-secondary-button">View live ↗</a>
            )}
            {existingSlug && <button type="button" onClick={() => void remove()} disabled={busy} className="admin-danger-button">Delete</button>}
            <button type="button" onClick={() => void save("draft")} disabled={busy} className="admin-secondary-button">
              {status === "published" ? "Unpublish" : "Save draft"}
            </button>
            <button type="button" onClick={() => void save("published")} disabled={busy} className="admin-primary-button">
              {busy ? "Saving…" : status === "published" ? "Update" : "Publish"}
            </button>
          </div>
        </div>
        {message && (
          <p role="status" className={`mx-auto mt-2 max-w-[1500px] text-sm ${message.kind === "ok" ? "text-emerald-700" : "text-red-700"}`}>
            {message.text}
          </p>
        )}
      </div>

      {recovery && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold-300 bg-gold-300/15 px-4 py-3 text-sm">
          <p className="text-ink-700">Unsaved work from {new Date(recovery.savedAt).toLocaleString()} was found in this browser.</p>
          <div className="flex gap-2">
            <button type="button" onClick={restoreRecovery} className="font-semibold text-emerald-700 hover:underline">Restore it</button>
            <button type="button" onClick={() => { localStorage.removeItem(recoveryKey); setRecovery(null); }} className="text-ink-400 hover:text-ink-700">Discard</button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1500px]">
        <input
          value={title}
          onChange={(event) => change(setTitle, event.target.value)}
          placeholder="Article title"
          className="w-full border-0 bg-transparent font-serif text-4xl font-semibold leading-tight text-emerald-950 outline-none placeholder:text-ink-400/40 sm:text-5xl"
        />
        <p className="mt-2 text-sm text-ink-400">Build the article visually below. Drag or paste images directly into the page.</p>

        <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <main className="min-w-0">
            <RichTextEditor value={body} onChange={(html) => change(setBody, html)} />
          </main>

          <aside className="space-y-4 xl:sticky xl:top-24">
            <Panel title="Publishing">
              <Field label="URL slug" hint={`/blog/${slug || "your-article"}`}>
                <input value={slug} onChange={(event) => { setSlugTouched(true); change(setSlug, slugify(event.target.value)); }} className={input} />
              </Field>
              <Field label="Publish date" hint="Leave empty to use the first publish time.">
                <input type="datetime-local" value={publishedAt} onChange={(event) => change(setPublishedAt, event.target.value)} className={input} />
              </Field>
              <Field label="Author">
                <input value={author} onChange={(event) => change(setAuthor, event.target.value)} className={input} />
              </Field>
            </Panel>

            <Panel title="Cover image">
              {cover ? (
                <div className="overflow-hidden rounded-lg border border-cream-200 bg-cream-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cover} alt="Cover preview" className="aspect-video w-full object-cover" />
                  <div className="flex items-center justify-between gap-2 p-2">
                    <button type="button" onClick={() => setMediaOpen(true)} className="text-xs font-semibold text-emerald-700">Replace</button>
                    <button type="button" onClick={() => change(setCover, "")} className="text-xs text-red-600">Remove</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setMediaOpen(true)} className="w-full rounded-lg border-2 border-dashed border-emerald-200 bg-emerald-50 px-4 py-7 text-sm font-semibold text-emerald-700 hover:border-emerald-400">
                  ＋ Upload or choose cover
                </button>
              )}
              <input value={cover} onChange={(event) => change(setCover, event.target.value)} placeholder="Or paste an image URL" className={`${input} mt-3`} />
            </Panel>

            <Panel title="Topics">
              <Field label="Categories" hint="Separate topics with commas.">
                <input value={categories} onChange={(event) => change(setCategories, event.target.value)} list="known-topics" placeholder="Tawakkul, Mental Health" className={input} />
                <datalist id="known-topics">{knownTopics.map((topic) => <option key={topic} value={topic} />)}</datalist>
              </Field>
            </Panel>

            <Panel title="Search & sharing">
              <Field label="Excerpt" hint={`${excerpt.length}/400 characters. Used on cards and search results.`}>
                <textarea value={excerpt} maxLength={400} onChange={(event) => change(setExcerpt, event.target.value)} rows={5} className={input} placeholder="A concise reason to read this article…" />
              </Field>
              <div className="rounded-lg border border-cream-200 bg-white p-3">
                <p className="truncate text-sm font-medium text-blue-700">{title || "Article title"}</p>
                <p className="mt-0.5 truncate text-xs text-emerald-700">sabrandsukoon.online/blog/{slug || "article"}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-500">{excerpt || "Your article excerpt will appear here."}</p>
              </div>
            </Panel>

            <p className="px-1 text-xs leading-5 text-ink-400">Keyboard shortcut: Ctrl/⌘ + S saves without changing the publish state. Unsaved work is backed up in this browser.</p>
          </aside>
        </div>
      </div>

      <MediaLibrary open={mediaOpen} onClose={() => setMediaOpen(false)} onSelect={chooseCover} title="Choose a cover image" />
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-cream-200 bg-cream-50 p-4 shadow-sm">
      <h2 className="mb-4 font-serif text-base font-semibold text-emerald-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block break-all text-[11px] leading-4 text-ink-400">{hint}</span>}
    </label>
  );
}
