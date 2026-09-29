/**
 * Draft queue for the automation engine.
 *
 * The auto-blogging engine pushes DRAFTS here via POST /api/ingest. Nothing is
 * ever published automatically — a human reviews each draft in /admin and
 * explicitly approves it, which writes a published post into the content store.
 *
 * Storage lives in content-store.ts: Vercel Blob in production, local files in
 * development. Nothing here touches the filesystem directly, so the queue works
 * on read-only serverless hosts.
 */
import "server-only";
import sanitizeHtml from "sanitize-html";
import { marked } from "marked";
import { slugifyLabel, SANITIZE_OPTS } from "./posts";
import {
  listStoredDrafts,
  getStoredDraft,
  saveStoredDraft,
  deleteStoredDraft,
  saveStoredPost,
  getStoredPost,
  type DraftRecord,
  type PostRecord,
} from "./content-store";
import { getAllPostMeta } from "./posts";

export type Draft = DraftRecord;

export function slugify(s: string): string {
  return s
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

export async function listDrafts(): Promise<Draft[]> {
  return listStoredDrafts();
}

export async function getDraft(id: string): Promise<Draft | null> {
  return getStoredDraft(id);
}

export async function saveDraft(d: Draft): Promise<void> {
  return saveStoredDraft(d);
}

export async function deleteDraft(id: string): Promise<void> {
  return deleteStoredDraft(id);
}

export async function draftCount(): Promise<number> {
  return (await listStoredDrafts()).length;
}

/** Resolve a draft's body to sanitized HTML (accepts html or markdown). */
export function draftToHtml(d: Draft): string {
  let html = d.contentHtml || "";
  if (!html && d.contentMarkdown) {
    html = marked.parse(d.contentMarkdown, { async: false }) as string;
  }
  // Sanitize with the same options used at render time so the admin preview is
  // faithful and published automation posts keep images/formatting.
  return sanitizeHtml(html, SANITIZE_OPTS);
}

/**
 * Approve & publish a draft: write it into the content store as a published
 * post and remove it from the queue. Returns the published slug.
 */
export async function publishDraft(
  id: string,
  overrides: Partial<Draft> = {}
): Promise<string> {
  const d = await getDraft(id);
  if (!d) throw new Error("Draft not found");
  const merged = { ...d, ...overrides };

  // Always re-slugify caller-supplied slugs, then make sure the result does not
  // collide with an existing article.
  const base = slugify(merged.slug || merged.title) || `post-${Date.now().toString(36)}`;
  const taken = new Set((await getAllPostMeta()).map((p) => p.slug));
  let slug = base;
  let n = 2;
  while (taken.has(slug) || (await getStoredPost(slug))) slug = `${base}-${n++}`;

  const now = new Date().toISOString();
  // Automation content arrives as HTML (or markdown we convert once), so it is
  // stored in html format — the same shape the migrated articles use.
  const html = draftToHtml(merged);

  const record: PostRecord = {
    slug,
    title: merged.title,
    excerpt:
      merged.excerpt ||
      html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160),
    author: merged.author || "Nazia Firdous",
    publishedAt: now,
    updatedAt: now,
    categories: merged.categories || [],
    cover: merged.cover || null,
    status: "published",
    format: "html",
    body: html,
    source: merged.source || "automation",
  };

  await saveStoredPost(record);
  await deleteDraft(id);
  return slug;
}

export { slugifyLabel };
