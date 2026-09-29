/**
 * The admin editor's view of the catalogue.
 *
 * Two sources sit behind it — the 73 articles migrated from Blogger (files in
 * the repo) and everything written since (the content store). The editor treats
 * them as one list. Saving an edit to a migrated article writes an override
 * into the store; the public site prefers that override, so the change takes
 * effect without ever needing to write to the read-only deployment filesystem.
 *
 * A migrated article keeps its original HTML body and is edited as HTML, so its
 * bespoke Blogger markup (ayah boxes, section cards) is never round-tripped
 * through markdown and destroyed. Posts written here are markdown.
 */
import "server-only";
import {
  listStoredPosts,
  getStoredPost,
  saveStoredPost,
  deleteStoredPost,
  renameStoredPost,
  type PostRecord,
} from "./content-store";
import { getFilePostSource, getAllFilePostMeta, invalidatePostsCache } from "./posts";
import { slugify } from "./drafts";

export type EditorListItem = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string | null;
  updatedAt: string | null;
  categories: string[];
  cover: string | null;
  status: "published" | "draft";
  /** "migrated" = still the original repo file; "edited" = overridden or authored here. */
  origin: "migrated" | "edited";
  format: "markdown" | "html";
};

/** Every post the admin can open, newest first. */
export async function listEditorPosts(): Promise<EditorListItem[]> {
  const stored = await listStoredPosts();
  const overridden = new Set(stored.map((r) => r.slug));

  const fromStore: EditorListItem[] = stored.map((r) => ({
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    author: r.author,
    publishedAt: r.publishedAt,
    updatedAt: r.updatedAt,
    categories: r.categories,
    cover: r.cover,
    status: r.status,
    origin: "edited",
    format: r.format,
  }));

  const fromFiles: EditorListItem[] = getAllFilePostMeta()
    .filter((p) => !overridden.has(p.slug))
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      author: p.author,
      publishedAt: p.publishedAt,
      updatedAt: p.updatedAt,
      categories: p.categories,
      cover: p.cover,
      status: "published" as const,
      origin: "migrated" as const,
      format: "html" as const,
    }));

  return [...fromStore, ...fromFiles].sort((a, b) => {
    const da = a.publishedAt || "";
    const db = b.publishedAt || "";
    return da < db ? 1 : da > db ? -1 : 0;
  });
}

/** Load one post for editing, from wherever it currently lives. */
export async function loadEditorPost(slug: string): Promise<PostRecord | null> {
  const stored = await getStoredPost(slug);
  if (stored) return stored;

  const meta = getAllFilePostMeta().find((p) => p.slug === slug);
  if (!meta) return null;
  const src = getFilePostSource(slug);
  if (!src) return null;

  return {
    slug: meta.slug,
    title: meta.title,
    excerpt: meta.excerpt,
    author: meta.author,
    publishedAt: meta.publishedAt,
    updatedAt: meta.updatedAt,
    categories: meta.categories,
    cover: meta.cover,
    status: "published",
    format: src.format,
    body: src.body,
    source: meta.source || "blogger-migration",
  };
}

export type SaveInput = {
  slug?: string;
  originalSlug?: string;
  title: string;
  excerpt?: string;
  author?: string;
  categories?: string[];
  cover?: string | null;
  status: "published" | "draft";
  format: "markdown" | "html";
  body: string;
  publishedAt?: string | null;
};

/** Strip characters that would break the frontmatter-style metadata line. */
function oneLine(v: string): string {
  return v.replace(/[\r\n\t]+/g, " ").trim();
}

/**
 * Create or update a post. Returns the slug it was saved under, which may
 * differ from the one requested if that slug was already taken.
 */
export async function saveEditorPost(
  input: SaveInput
): Promise<{ slug: string; renamedFrom?: string }> {
  const title = oneLine(input.title) || "Untitled";
  const base = slugify(input.slug || title) || `post-${Date.now().toString(36)}`;

  const original = input.originalSlug;
  let slug = base;

  // Only guard against collisions when the slug is actually changing, otherwise
  // saving a post twice would keep appending suffixes to its own slug.
  if (slug !== original) {
    const taken = new Set((await listEditorPosts()).map((p) => p.slug));
    let n = 2;
    while (taken.has(slug)) slug = `${base}-${n++}`;
  }

  const now = new Date().toISOString();
  const existing = original ? await getStoredPost(original) : null;

  const record: PostRecord = {
    slug,
    title,
    excerpt: oneLine(input.excerpt || ""),
    author: oneLine(input.author || "") || "Nazia Firdous",
    // Keep the original publication date across edits; stamp one on first publish.
    publishedAt:
      input.publishedAt ||
      existing?.publishedAt ||
      (input.status === "published" ? now : null),
    updatedAt: now,
    categories: (input.categories || []).map(oneLine).filter(Boolean),
    cover: input.cover ? oneLine(input.cover) : null,
    status: input.status,
    format: input.format,
    body: input.body || "",
    source: existing?.source || "editor",
  };

  if (original && original !== slug) {
    await renameStoredPost(original, record);
  } else {
    await saveStoredPost(record);
  }

  invalidatePostsCache();
  return { slug, renamedFrom: original && original !== slug ? original : undefined };
}

/**
 * Remove a post. A migrated article has no store entry to delete, so it is
 * shadowed by an unpublished override instead — the reader-facing result is the
 * same, and the original file stays intact in the repository.
 */
export async function deleteEditorPost(slug: string): Promise<"deleted" | "unpublished"> {
  const hasRepoFile = getAllFilePostMeta().some((p) => p.slug === slug);

  // A migrated article lives in the repository and cannot be removed from a
  // read-only deployment — and simply dropping its override would revert it to
  // the original and leave it live, which is the opposite of what "delete"
  // means. Shadow it with an unpublished override instead.
  if (hasRepoFile) {
    const base = await loadEditorPost(slug);
    if (!base) throw new Error("Post not found");
    await saveStoredPost({
      ...base,
      status: "draft",
      updatedAt: new Date().toISOString(),
    });
    invalidatePostsCache();
    return "unpublished";
  }

  const stored = await getStoredPost(slug);
  if (!stored) throw new Error("Post not found");
  await deleteStoredPost(slug);
  invalidatePostsCache();
  return "deleted";
}
