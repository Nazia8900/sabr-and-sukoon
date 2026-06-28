/**
 * File-based content loader.
 *
 * Published posts live in `content/posts/*` and are read at build time.
 * Two formats are supported so human-written blogs are easy to add later:
 *   • `<slug>.json`  — { title, contentHtml, ... }  (used by the Blogger migration)
 *   • `<slug>.md`    — Markdown with YAML-ish frontmatter (used for new posts)
 *
 * To add a new article, drop a file into `content/posts/`. That's it.
 */
import "server-only";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { slugifyLabel } from "./slug";

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
    ],
    iframe: ["src", "width", "height", "allow", "allowfullscreen", "title"],
    "*": ["style", "class", "id", "dir", "lang"],
  },
  allowedStyles: { "*": LAYOUT_STYLE },
  allowedSchemes: ["http", "https", "mailto"],
  allowedIframeHostnames: ["www.youtube.com", "youtube.com", "player.vimeo.com"],
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
}

/** Shared sanitizer options (also used to sanitize automation content at ingest). */
export { SANITIZE_OPTS };

export function getAllPosts(): Post[] {
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

export function getAllPostMeta(): PostMeta[] {
  return getAllPosts().map(({ contentHtml: _c, ...rest }) => rest);
}

export function getPost(slug: string): Post | null {
  return getAllPosts().find((p) => p.slug === slug) || null;
}

export function getPostsByCategorySlug(catSlug: string): Post[] {
  return getAllPosts().filter((p) =>
    p.categories.some((c) => slugifyLabel(c) === catSlug)
  );
}

export function getRelatedPosts(post: Post, limit = 3): PostMeta[] {
  const set = new Set(post.categories.map(slugifyLabel));
  return getAllPostMeta()
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
