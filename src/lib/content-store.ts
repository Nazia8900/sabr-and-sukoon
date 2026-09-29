/**
 * Content store for posts written in the admin dashboard.
 *
 * The 73 articles migrated from Blogger stay exactly where they are — files in
 * `content/posts/`, read at build time. This store holds only the posts Nazia
 * writes in the browser, and the site merges the two sources.
 *
 * Where those posts live depends on the environment:
 *   • Vercel Blob   — when BLOB_STORE_ID is present (production).
 *   • Filesystem    — otherwise, under content/posts/. Keeps `npm run dev`
 *                     working with no configuration at all.
 *
 * Vercel injects the Blob credentials automatically when a store is connected
 * to the project, so there is nothing to paste by hand. Blobs are written with
 * access: "private", so an unpublished draft is never readable over the web —
 * only this server, authenticated to the store, can fetch it.
 */
import "server-only";
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
  unlinkSync,
  renameSync,
} from "node:fs";
import { join } from "node:path";

/** Raw stored shape. `body` is the source; `format` says how to render it. */
export type PostRecord = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string | null;
  updatedAt: string | null;
  categories: string[];
  cover: string | null;
  status: "published" | "draft";
  /** New and edited posts use HTML; legacy markdown records remain readable. */
  format: "markdown" | "html";
  body: string;
  source: string;
};

/** Metadata only — what list views need, without shipping every post body. */
export type PostRecordMeta = Omit<PostRecord, "body">;

export const blobEnabled = Boolean(
  process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN
);

/** Where writes are going — surfaced in the admin UI so it is never a mystery. */
export function storeMode(): { mode: "blob" | "filesystem"; label: string } {
  return blobEnabled
    ? { mode: "blob", label: "Vercel Blob" }
    : { mode: "filesystem", label: "local files" };
}

const PREFIX = "posts/";
const INDEX_PATH = "posts/_index.json";
// Deliberately NOT content/posts/ — that directory is scanned by the file
// loader, and a store file sitting in it would be read twice.
const LOCAL_DIR = join(process.cwd(), "content", "editor-posts");

/* ─────────────────────────── Vercel Blob ─────────────────────────── */

/**
 * Blob paths are stable (no random suffix) so a post can be overwritten in
 * place. An index blob holds metadata for every stored post, so list views
 * cost one request instead of one per post.
 */
async function blobPut(path: string, data: unknown): Promise<void> {
  const { put } = await import("@vercel/blob");
  await put(path, JSON.stringify(data, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

async function blobRead<T>(path: string): Promise<T | null> {
  const { get } = await import("@vercel/blob");
  try {
    // useCache: false — a post must never come back stale straight after a save.
    const result = await get(path, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as T;
  } catch (e) {
    // A missing blob is an expected outcome, not a failure.
    if (e instanceof Error && /not.?found/i.test(e.name + e.message)) return null;
    throw e;
  }
}

async function blobDelete(path: string): Promise<void> {
  const { del } = await import("@vercel/blob");
  try {
    await del(path);
  } catch (e) {
    if (e instanceof Error && /not.?found/i.test(e.name + e.message)) return;
    throw e;
  }
}

async function readIndex(): Promise<PostRecordMeta[]> {
  return (await blobRead<PostRecordMeta[]>(INDEX_PATH)) || [];
}

async function writeIndex(entries: PostRecordMeta[]): Promise<void> {
  await blobPut(INDEX_PATH, entries);
}

/* ────────────────────────── filesystem ───────────────────────────── */

function localPath(slug: string): string {
  return join(LOCAL_DIR, `${slug}.json`);
}

/**
 * Write via a temporary file and rename. A plain writeFileSync truncates first,
 * so a page rendering at that moment can read a half-written file and fail to
 * parse it. Rename is atomic, so a reader sees either the old file or the new.
 */
function writeAtomic(file: string, contents: string): void {
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, contents, "utf8");
  renameSync(tmp, file);
}

function localList(): PostRecord[] {
  if (!existsSync(LOCAL_DIR)) return [];
  const out: PostRecord[] = [];
  for (const f of readdirSync(LOCAL_DIR)) {
    if (!f.endsWith(".json") || f.includes(".tmp")) continue;
    try {
      out.push(JSON.parse(readFileSync(join(LOCAL_DIR, f), "utf8")));
    } catch {
      /* skip corrupt */
    }
  }
  return out;
}

/* ──────────────────────────── public API ─────────────────────────── */

/** Every post held in this store, metadata only. */
export async function listStoredPosts(): Promise<PostRecordMeta[]> {
  if (blobEnabled) return readIndex();
  return localList().map(({ body: _b, ...rest }) => rest);
}

/** One post, including its body. */
export async function getStoredPost(slug: string): Promise<PostRecord | null> {
  if (blobEnabled) return blobRead<PostRecord>(`${PREFIX}${slug}.json`);
  const file = localPath(slug);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as PostRecord;
  } catch {
    return null;
  }
}

/** Create or replace a post, keeping the index in step. */
export async function saveStoredPost(record: PostRecord): Promise<void> {
  if (blobEnabled) {
    await blobPut(`${PREFIX}${record.slug}.json`, record);
    const { body: _b, ...meta } = record;
    const index = await readIndex();
    const next = index.filter((e) => e.slug !== record.slug);
    next.push(meta);
    await writeIndex(next);
    return;
  }
  mkdirSync(LOCAL_DIR, { recursive: true });
  writeAtomic(localPath(record.slug), JSON.stringify(record, null, 2));
}

/** Remove a post entirely. */
export async function deleteStoredPost(slug: string): Promise<void> {
  if (blobEnabled) {
    await blobDelete(`${PREFIX}${slug}.json`);
    await writeIndex((await readIndex()).filter((e) => e.slug !== slug));
    return;
  }
  const file = localPath(slug);
  if (existsSync(file)) unlinkSync(file);
}

/** Rename: write under the new slug, drop the old one. */
export async function renameStoredPost(
  oldSlug: string,
  record: PostRecord
): Promise<void> {
  await saveStoredPost(record);
  if (oldSlug !== record.slug) await deleteStoredPost(oldSlug);
}

/** Full export — used by the admin "Export all posts" button. */
export async function exportStoredPosts(): Promise<PostRecord[]> {
  const metas = await listStoredPosts();
  const full: PostRecord[] = [];
  for (const m of metas) {
    const p = await getStoredPost(m.slug);
    if (p) full.push(p);
  }
  return full;
}

/* ─────────────────── automation drafts (POST /api/ingest) ─────────────────── */

/**
 * Drafts pushed by the automation engine. Volume is low (a handful at a time),
 * so on Blob they live in one document — a single read and a single write per
 * operation. Locally they stay as individual files under content/drafts/, which
 * is what the file adapter always did.
 */
export type DraftRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  author?: string;
  categories: string[];
  cover?: string | null;
  contentHtml?: string;
  contentMarkdown?: string;
  status: "draft";
  source: string;
  meta?: Record<string, unknown>;
  createdAt: string;
};

const DRAFTS_BLOB = "drafts/_all.json";
const LOCAL_DRAFTS_DIR = join(process.cwd(), "content", "drafts");

export async function listStoredDrafts(): Promise<DraftRecord[]> {
  if (blobEnabled) {
    const all = (await blobRead<DraftRecord[]>(DRAFTS_BLOB)) || [];
    return all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  if (!existsSync(LOCAL_DRAFTS_DIR)) return [];
  const out: DraftRecord[] = [];
  for (const f of readdirSync(LOCAL_DRAFTS_DIR)) {
    if (!f.endsWith(".json")) continue;
    try {
      out.push(JSON.parse(readFileSync(join(LOCAL_DRAFTS_DIR, f), "utf8")));
    } catch {
      /* skip corrupt */
    }
  }
  return out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getStoredDraft(id: string): Promise<DraftRecord | null> {
  return (await listStoredDrafts()).find((d) => d.id === id) || null;
}

export async function saveStoredDraft(draft: DraftRecord): Promise<void> {
  if (blobEnabled) {
    const all = (await blobRead<DraftRecord[]>(DRAFTS_BLOB)) || [];
    await blobPut(DRAFTS_BLOB, [...all.filter((d) => d.id !== draft.id), draft]);
    return;
  }
  mkdirSync(LOCAL_DRAFTS_DIR, { recursive: true });
  writeAtomic(
    join(LOCAL_DRAFTS_DIR, `${draft.id}.json`),
    JSON.stringify(draft, null, 2)
  );
}

export async function deleteStoredDraft(id: string): Promise<void> {
  if (blobEnabled) {
    const all = (await blobRead<DraftRecord[]>(DRAFTS_BLOB)) || [];
    await blobPut(DRAFTS_BLOB, all.filter((d) => d.id !== id));
    return;
  }
  const file = join(LOCAL_DRAFTS_DIR, `${id}.json`);
  if (existsSync(file)) unlinkSync(file);
}
