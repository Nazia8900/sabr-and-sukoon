/** Shared request shape and cache refresh for the admin post endpoints. */
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const postSchema = z.object({
  slug: z.string().max(120).optional(),
  originalSlug: z.string().max(120).optional(),
  title: z.string().min(1, "A title is required").max(300),
  excerpt: z.string().max(400).optional(),
  author: z.string().max(120).optional(),
  categories: z.array(z.string().max(80)).max(30).optional(),
  cover: z.string().max(2000).nullable().optional(),
  status: z.enum(["published", "draft"]),
  format: z.enum(["markdown", "html"]),
  body: z.string().max(500_000),
  publishedAt: z.string().nullable().optional(),
});

/** Refresh every route whose content could have changed. */
export function refreshSite(slug: string): void {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/topics");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/rss.xml");
}
