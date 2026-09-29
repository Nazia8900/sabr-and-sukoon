/**
 * Content loader — merges two sources into one list of posts.
 *
 * 1. Repository files in `content/posts/`, read at build time:
 *      • `<slug>.json`  — { title, contentHtml, ... }  (the Blogger migration)
 *      • `<slug>.md`    — Markdown with YAML-ish frontmatter
 *    Dropping a file in still works exactly as before.
 *
 * 2. Posts written in the admin dashboard, held in the content store
 *    (Vercel Blob in production, local files in development).
 *
 * Reads are async because the store may be over the network. Results are
 * cached in module scope for the lifetime of a render/build pass; publishing
 * from the admin calls invalidatePostsCache() so a new post shows immediately.
 */
import "server-only";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { slugifyLabel } from "./slug";
import { listStoredPosts, getStoredPost, type PostRecord } from "./content-store";

const POSTS_DIR = join(process.cwd(), "content", "posts");

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string | null;
  updatedAt: string | null;
  categories: string[];
  cover: string | null;
  contentHtml: string;
  readingMinutes: number;
  status: string;
  source?: string;
  oldPath?: string | null;
};

export type PostMeta = Omit<Post, "contentHtml">;

// Migrated posts keep their structural CSS *classes* (styled by the shared
// stylesheet in globals.css) plus layout-only inline styles. We deliberately do
// NOT allow <style> tags (they previously leaked global CSS) and we restrict
// inline styles to a layout allowlist — no position/z-index/background/font — so
// neither first-party nor automation-ingested content can do CSS-based UI redress.
const LAYOUT_STYLE: Record<string, RegExp[]> = {
  color: [
    /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%]+\)|[a-z]+)$/i,
  ],
  "background-color": [
    /^(transparent|#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%]+\)|[a-z]+)$/i,
  ],
  "font-family": [/^[a-z0-9 ,.'"-]+$/i],
  "font-size": [/^\d+(\.\d+)?(px|rem|em|%)$/i],
  "font-weight": [/^(normal|bold|bolder|lighter|[1-9]00)$/],
  "font-style": [/^(normal|italic|oblique)$/],
  "text-decoration": [/^(none|underline|line-through|overline)(\s+(solid|double|dotted|dashed|wavy))?$/],
  "letter-spacing": [/^(normal|-?\d+(\.\d+)?(px|rem|em))$/],
  "text-align": [/^(left|right|center|justify)$/],
  padding: [/.*/],
  "padding-top": [/.*/],
  "padding-right": [/.*/],
  "padding-bottom": [/.*/],
  "padding-left": [/.*/],
  margin: [/.*/],
  "margin-top": [/.*/],
  "margin-right": [/.*/],
  "margin-bottom": [/.*/],
  "margin-left": [/.*/],
  border: [/.*/],
  "border-top": [/.*/],
  "border-right": [/.*/],
  "border-bottom": [/.*/],
  "border-left": [/.*/],
  "border-color": [/.*/],
  "border-width": [/.*/],
  "border-style": [/.*/],
  "border-radius": [/.*/],
  width: [/.*/],
  "max-width": [/.*/],
  "min-width": [/.*/],
  height: [/.*/],
  "max-height": [/.*/],
  display: [/^(block|inline|inline-block|flex|grid|none)$/],
  float: [/^(left|right|none)$/],
  clear: [/^(both|left|right|none)$/],
  "line-height": [/.*/],
  "list-style": [/.*/],
  gap: [/.*/],
  "object-fit": [/^(contain|cover|fill|none|scale-down)$/],
  "align-items": [/^(start|end|center|stretch|flex-start|flex-end|baseline)$/],
  "justify-content": [/^(start|end|center|stretch|space-between|space-around|space-evenly|flex-start|flex-end)$/],
  "flex-direction": [/^(row|row-reverse|column|column-reverse)$/],
  "flex-wrap": [/^(nowrap|wrap|wrap-reverse)$/],
};

const SANITIZE_OPTS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "h2",
    "figure",
    "figcaption",
    "iframe",
    "span",
    "u",
    "s",
    "sup",
    "sub",
    "section",
    "mark",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "th",
    "td",
    "colgroup",
    "col",
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: ["href", "name", "target", "rel", "class"],
    img: [
      "src",
      "alt",
      "title",
      "width",
      "height",
      "loading",
      "decoding",
      "class",
      "data-original-width",
      "data-original-height",
      "data-width",
      "data-align",
    ],
    iframe: [
      "src",
      "width",
      "height",
      "allow",
      "allowfullscreen",
      "frameborder",
      "title",
      "class",
    ],
    div: ["style", "class", "id", "dir", "lang", "data-youtube-video"],
    table: ["style", "class"],
    th: ["style", "class", "colspan", "rowspan", "colwidth"],
    td: ["style", "class", "colspan", "rowspan", "colwidth"],
    "*": ["style", "class", "id", "dir", "lang", "data-width", "data-align"],
  },
  allowedStyles: { "*": LAYOUT_STYLE },
  allowedSchemes: ["http", "https", "mailto"],
  allowedIframeHostnames: [
    "www.youtube.com",
    "youtube.com",
    "www.youtube-nocookie.com",
    "youtube-nocookie.com",
    "player.vimeo.com",
  ],
  transformTags: {
    a: (tagName, attribs) => {
      const out = { ...attribs };
      if (out.href && /^https?:\/\//.test(out.href)) {
        out.target = "_blank";
        out.rel = "noopener noreferrer";
      }
      return { tagName, attribs: out };
    },
    h1: "h2", // never allow a second <h1> in the body (page title is the H1)
    img: (tagName, attribs) => {
      const out = { ...attribs };
      if (out.alt === undefined) out.alt = "";
      if (!out.loading) out.loading = "lazy";
      if (!out.decoding) out.decoding = "async";
      return { tagName, attribs: out };
    },
  },
};

function wordCount(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text ? text.split(" ").length : 0;
}

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw };
  const data: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    )
      val = val.slice(1, -1);
    data[key] = val;
  }
  return { data, body: m[2] };
}

function plain(html: string, len = 160): string {
  const t = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t.length <= len ? t : t.slice(0, len).replace(/\s+\S*$/, "") + "…";
}

function loadFile(file: string): Post | null {
  const full = join(POSTS_DIR, file);
  const raw = readFileSync(full, "utf8");

  if (file.endsWith(".json")) {
    const j = JSON.parse(raw);
    if (j.status && j.status !== "published") return null;
    const html = sanitizeHtml(j.contentHtml || "", SANITIZE_OPTS);
    return {
      slug: j.slug || file.replace(/\.json$/, ""),
      title: j.title || "Untitled",
      excerpt: j.excerpt || plain(html),
      author: j.author || "Nazia Firdous",
      publishedAt: j.publishedAt || null,
      updatedAt: j.updatedAt || j.publishedAt || null,
      categories: j.categories || [],
      cover: j.cover || null,
      contentHtml: html,
      readingMinutes: Math.max(1, Math.round(wordCount(html) / 200)),
      status: j.status || "published",
      source: j.source,
      oldPath: j.oldPath ?? null,
    };
  }

  if (file.endsWith(".md") || file.endsWith(".mdx")) {
    const { data, body } = parseFrontmatter(raw);
    if (data.status && data.status !== "published") return null;
    const html = sanitizeHtml(marked.parse(body, { async: false }) as string, SANITIZE_OPTS);
    return {
      slug: data.slug || file.replace(/\.mdx?$/, ""),
      title: data.title || "Untitled",
      excerpt: data.excerpt || plain(html),
      author: data.author || "Nazia Firdous",
      publishedAt: data.publishedAt || data.date || null,
      updatedAt: data.updatedAt || data.publishedAt || data.date || null,
      categories: data.categories
        ? data.categories.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      cover: data.cover || null,
      contentHtml: html,
      readingMinutes: Math.max(1, Math.round(wordCount(html) / 200)),
      status: data.status || "published",
      source: data.source || "manual",
      oldPath: data.oldPath || null,
    };
  }

  return null;
}

let _cache: Post[] | null = null;

/** Reset the in-memory cache so a freshly published post is picked up immediately. */
export function invalidatePostsCache(): void {
  _cache = null;
  _metaCache = null;
  _metaCacheAt = 0;
}

/** Shared sanitizer options (also used to sanitize automation content at ingest). */
export { SANITIZE_OPTS };

function getFilePosts(): Post[] {
  if (_cache) return _cache;
  if (!existsSync(POSTS_DIR)) return [];
  const posts: Post[] = [];
  for (const file of readdirSync(POSTS_DIR)) {
    if (file.startsWith(".") || file.startsWith("_")) continue;
    try {
      const p = loadFile(file);
      if (p) posts.push(p);
    } catch (e) {
      console.error(`[posts] failed to load ${file}:`, e);
    }
  }
  posts.sort((a, b) => {
    const da = a.publishedAt || "";
    const db = b.publishedAt || "";
    return da < db ? 1 : da > db ? -1 : 0;
  });
  _cache = posts;
  return posts;
}

/* ───────────────── store-backed posts (written in /admin) ───────────────── */

/** Render a stored record's source into the same sanitized HTML the site uses. */
export function renderRecordHtml(record: Pick<PostRecord, "format" | "body">): string {
  const raw =
    record.format === "markdown"
      ? (marked.parse(record.body || "", { async: false }) as string)
      : record.body || "";
  return sanitizeHtml(raw, SANITIZE_OPTS);
}

function recordToPost(record: PostRecord): Post {
  const html = renderRecordHtml(record);
  return {
    slug: record.slug,
    title: record.title || "Untitled",
    excerpt: record.excerpt || plain(html),
    author: record.author || "Nazia Firdous",
    publishedAt: record.publishedAt,
    updatedAt: record.updatedAt || record.publishedAt,
    categories: record.categories || [],
    cover: record.cover || null,
    contentHtml: html,
    readingMinutes: Math.max(1, Math.round(wordCount(html) / 200)),
    status: record.status,
    source: record.source || "editor",
    oldPath: null,
  };
}

let _metaCache: PostMeta[] | null = null;
let _metaCacheAt = 0;

/**
 * The merged list is cached so one render pass does not re-read the store for
 * every component. The TTL matters in production: an edit saved by one
 * serverless instance leaves any other warm instance holding a stale module
 * cache, and without an expiry that instance would serve the old content until
 * it was recycled.
 */
const META_TTL_MS = 30_000;

function sortByDateDesc<T extends { publishedAt: string | null }>(items: T[]): T[] {
  return items.sort((a, b) => {
    const da = a.publishedAt || "";
    const db = b.publishedAt || "";
    return da < db ? 1 : da > db ? -1 : 0;
  });
}

/**
 * Metadata for every published post, from both sources. This is what list
 * views, the sitemap and the RSS feed use — no post bodies are loaded.
 */
export async function getAllPostMeta(): Promise<PostMeta[]> {
  if (_metaCache && Date.now() - _metaCacheAt < META_TTL_MS) return _metaCache;

  const fileMeta: PostMeta[] = getFilePosts().map(({ contentHtml: _c, ...rest }) => rest);

  let storedMeta: PostMeta[] = [];
  let overridden = new Set<string>();
  try {
    const stored = await listStoredPosts();
    // A stored post OVERRIDES a repo file with the same slug: that is how an
    // edit to one of the 73 migrated articles takes effect, and how unpublishing
    // one hides it (the override is kept but its status is "draft").
    overridden = new Set(stored.map((r) => r.slug));
    storedMeta = stored
      .filter((r) => r.status === "published")
      .map((r) => ({
        slug: r.slug,
        title: r.title || "Untitled",
        excerpt: r.excerpt || "",
        author: r.author || "Nazia Firdous",
        publishedAt: r.publishedAt,
        updatedAt: r.updatedAt || r.publishedAt,
        categories: r.categories || [],
        cover: r.cover || null,
        readingMinutes: 1,
        status: r.status,
        source: r.source || "editor",
        oldPath: null,
      }));
  } catch (e) {
    // A store outage must never take the public site down — the 73 migrated
    // articles still render from the repo.
    console.error("[posts] content store unavailable:", e);
  }

  const files = fileMeta.filter((p) => !overridden.has(p.slug));
  _metaCache = sortByDateDesc([...files, ...storedMeta]);
  _metaCacheAt = Date.now();
  return _metaCache;
}

/** One published post with its body. */
export async function getPost(slug: string): Promise<Post | null> {
  // The store is checked first so an edited version of a migrated article wins.
  try {
    const record = await getStoredPost(slug);
    if (record) return record.status === "published" ? recordToPost(record) : null;
  } catch (e) {
    console.error(`[posts] could not load stored post ${slug}:`, e);
  }
  return getFilePosts().find((p) => p.slug === slug) || null;
}

/**
 * The editable source behind a repo file — the markdown a `.md` post was
 * written in, or the raw HTML of a migrated `.json` post. Needed so the admin
 * editor can open one of the 73 migrated articles without mangling it.
 */
export function getFilePostSource(
  slug: string
): { format: "markdown" | "html"; body: string } | null {
  for (const ext of [".json", ".md", ".mdx"] as const) {
    const file = join(POSTS_DIR, `${slug}${ext}`);
    if (!existsSync(file)) continue;
    const raw = readFileSync(file, "utf8");
    if (ext === ".json") {
      try {
        return { format: "html", body: JSON.parse(raw).contentHtml || "" };
      } catch {
        return null;
      }
    }
    return { format: "markdown", body: parseFrontmatter(raw).body };
  }
  return null;
}

/** Metadata for the repo files only — the admin list needs these separately. */
export function getAllFilePostMeta(): PostMeta[] {
  return getFilePosts().map(({ contentHtml: _c, ...rest }) => rest);
}

/** Slugs only — for generateStaticParams. */
export async function getAllPostSlugs(): Promise<string[]> {
  return (await getAllPostMeta()).map((p) => p.slug);
}

export async function getPostsByCategorySlug(catSlug: string): Promise<PostMeta[]> {
  return (await getAllPostMeta()).filter((p) =>
    p.categories.some((c) => slugifyLabel(c) === catSlug)
  );
}

export async function getRelatedPosts(post: Post, limit = 3): Promise<PostMeta[]> {
  const set = new Set(post.categories.map(slugifyLabel));
  return (await getAllPostMeta())
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({
      p,
      score: p.categories.filter((c) => set.has(slugifyLabel(c))).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

export { slugifyLabel };
