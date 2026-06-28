/**
 * Draft queue store (file adapter).
 *
 * The auto-blogging engine pushes DRAFTS here via POST /api/ingest. Nothing is
 * ever published automatically — a human reviews each draft in /admin and
 * explicitly approves it, which writes a published file into content/posts/.
 *
 * Adapter note: this file-based store works locally and on any host with a
 * writable filesystem. On read-only/serverless hosts (e.g. Vercel) swap the
 * internals of this module for a KV/DB (Vercel KV, Postgres, Turso, etc.) —
 * the exported function signatures are all you need to keep.
 */
import "server-only";
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
  unlinkSync,
} from "node:fs";
import { join } from "node:path";
import sanitizeHtml from "sanitize-html";
import { marked } from "marked";
import { slugifyLabel, SANITIZE_OPTS } from "./posts";

const DRAFTS_DIR = join(process.cwd(), "content", "drafts");
const POSTS_DIR = join(process.cwd(), "content", "posts");

export type Draft = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  author?: string;
  categories: string[];
  cover?: string | null;
  // content may arrive as html or markdown
  contentHtml?: string;
  contentMarkdown?: string;
  status: "draft";
  source: string; // e.g. "make.com", "manual"
  meta?: Record<string, unknown>; // topic, keywords, model used, source links…
  createdAt: string;
};

function ensure() {
  if (!existsSync(DRAFTS_DIR)) mkdirSync(DRAFTS_DIR, { recursive: true });
}

const SAFE_ID = /^[a-z0-9][a-z0-9-]{0,80}$/;

/** Reject ids/slugs that could escape the intended directory (path traversal). */
function safeName(name: string): string {
  if (!name || !SAFE_ID.test(name)) throw new Error("Invalid id/slug");
  return name;
}

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

export function listDrafts(): Draft[] {
  ensure();
  const out: Draft[] = [];
  for (const f of readdirSync(DRAFTS_DIR)) {
    if (!f.endsWith(".json")) continue;
    try {
      out.push(JSON.parse(readFileSync(join(DRAFTS_DIR, f), "utf8")));
    } catch {
      /* skip corrupt */
    }
  }
  return out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getDraft(id: string): Draft | null {
  ensure();
  const file = join(DRAFTS_DIR, `${safeName(id)}.json`);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

export function saveDraft(d: Draft): void {
  ensure();
  writeFileSync(
    join(DRAFTS_DIR, `${safeName(d.id)}.json`),
    JSON.stringify(d, null, 2),
    "utf8"
  );
}

export function deleteDraft(id: string): void {
  const file = join(DRAFTS_DIR, `${safeName(id)}.json`);
  if (existsSync(file)) unlinkSync(file);
}

export function draftCount(): number {
  ensure();
  return readdirSync(DRAFTS_DIR).filter((f) => f.endsWith(".json")).length;
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
 * Approve & publish a draft: write content/posts/<slug>.json and remove the draft.
 * Returns the published slug. (On read-only FS this throws — see adapter note.)
 */
export function publishDraft(id: string, overrides: Partial<Draft> = {}): string {
  const d = getDraft(id);
  if (!d) throw new Error("Draft not found");
  const merged = { ...d, ...overrides };

  // Always re-slugify caller-supplied slugs so a published file can never escape
  // the posts directory (path-traversal hardening).
  let slug = slugify(merged.slug || merged.title) || `post-${Date.now().toString(36)}`;
  // avoid clobbering an existing published post
  let candidate = slug;
  let n = 2;
  while (existsSync(join(POSTS_DIR, `${candidate}.json`))) candidate = `${slug}-${n++}`;
  slug = candidate;

  const now = new Date().toISOString();
  const html = draftToHtml(merged);
  const post = {
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
    source: merged.source || "automation",
    oldPath: null,
    contentHtml: html,
  };

  if (!existsSync(POSTS_DIR)) mkdirSync(POSTS_DIR, { recursive: true });
  writeFileSync(join(POSTS_DIR, `${slug}.json`), JSON.stringify(post, null, 2), "utf8");
  deleteDraft(id);
  return slug;
}

export { slugifyLabel };
