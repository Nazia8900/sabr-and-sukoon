import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllPostSlugs, getPost, getRelatedPosts, slugifyLabel } from "@/lib/posts";
import { postMetadata, articleLd, breadcrumbLd } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import JsonLd from "@/components/JsonLd";
import AuthorBox from "@/components/AuthorBox";
import PostCard from "@/components/PostCard";
import ReadingProgress from "@/components/ReadingProgress";
import TableOfContents, { type TocItem } from "@/components/TableOfContents";
import { site } from "@/lib/site";

// Publishing calls revalidatePath, so changes appear immediately; this hourly
// revalidate is only a backstop in case an on-demand refresh is ever missed.
export const revalidate = 3600;
export const dynamicParams = true;

/**
 * Parse the (already sanitized) post HTML for h2/h3 headings, inject a stable
 * slug `id` onto each heading (preserving any author-supplied id), and return
 * both the rewritten HTML and the flat list of TOC items. Runs server-side at
 * build/revalidate time so the client ships only the finished markup.
 */
function buildToc(html: string): { html: string; items: TocItem[] } {
  const items: TocItem[] = [];
  const used = new Set<string>();

  const headingText = (inner: string) =>
    inner
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim();

  const uniqueId = (base: string) => {
    const root =
      slugifyLabel(base) || `section-${items.length + 1}`;
    let id = root;
    let n = 2;
    while (used.has(id)) id = `${root}-${n++}`;
    used.add(id);
    return id;
  };

  const rewritten = html.replace(
    /<(h2|h3)\b([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag: string, attrs: string, inner: string) => {
      const text = headingText(inner);
      if (!text) return match; // skip empty/decorative headings
      const existing = attrs.match(/\sid\s*=\s*["']([^"']+)["']/i);
      const id = existing ? existing[1] : uniqueId(text);
      if (existing) used.add(id);
      items.push({ id, text, level: tag.toLowerCase() === "h2" ? 2 : 3 });
      const attrsWithId = existing ? attrs : `${attrs} id="${id}"`;
      return `<${tag}${attrsWithId}>${inner}</${tag}>`;
    }
  );

  return { html: rewritten, items };
}

export async function generateStaticParams() {
  return (await getAllPostSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  // Served with a 200 by Next despite rendering the not-found page, so make it
  // explicitly non-indexable rather than let a soft 404 into the search index.
  if (!post) return { title: "Not found", robots: { index: false, follow: false } };
  return postMetadata(post);
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post, 3);

  const { html: contentHtml, items: tocItems } = buildToc(post.contentHtml);
  // Only surface a TOC when there's enough structure to navigate.
  const toc = tocItems.length >= 3 ? tocItems : [];

  const primaryCategory = post.categories[0];
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Articles", path: "/blog" },
    ...(primaryCategory
      ? [{ name: primaryCategory, path: `/topics/${slugifyLabel(primaryCategory)}` }]
      : []),
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  return (
    <article className="pb-10">
      <ReadingProgress />
      <JsonLd data={[articleLd(post), breadcrumbLd(breadcrumbs)]} />

      {/* Header */}
      <header className="border-b border-cream-200 bg-gradient-to-b from-emerald-50 to-cream-50">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink-400">
            <Link href="/" className="hover:text-emerald-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-emerald-600">Articles</Link>
            {primaryCategory && (
              <>
                <span className="mx-2">/</span>
                <Link
                  href={`/topics/${slugifyLabel(primaryCategory)}`}
                  className="hover:text-emerald-600"
                >
                  {primaryCategory}
                </Link>
              </>
            )}
          </nav>
          {post.categories[0] && (
            <Link
              href={`/topics/${slugifyLabel(post.categories[0])}`}
              className="text-sm font-semibold uppercase tracking-wide text-emerald-600 hover:text-emerald-800"
            >
              {post.categories[0]}
            </Link>
          )}
          <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-emerald-900 sm:text-4xl">
            {post.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
            <Link href={`/author/${site.author.slug}`} className="font-medium text-emerald-700 hover:text-emerald-900">
              {post.author}
            </Link>
            <span>·</span>
            <time dateTime={post.publishedAt || undefined}>{formatDate(post.publishedAt)}</time>
            <span>·</span>
            <span>{post.readingMinutes} min read</span>
          </div>
        </div>
      </header>

      {/* Migrated posts embed their own featured image inside the styled body, so we
          only render a standalone cover for posts that don't (e.g. new markdown posts). */}
      {post.cover && post.source !== "blogger-migration" && (
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="relative -mt-0 aspect-[16/9] overflow-hidden rounded-b-[var(--radius-card)]">
            <Image
              src={post.cover}
              alt={post.title}
              fill
              priority
              sizes="(max-width:896px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-6xl">
        <div className="mt-10 lg:grid lg:grid-cols-[1fr_15rem] lg:gap-12">
          <div className="min-w-0 lg:max-w-3xl">
            {toc.length > 0 && (
              <div className="lg:hidden">
                <TableOfContents items={toc} />
              </div>
            )}
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            {/* Tags */}
            {post.categories.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2 border-t border-cream-200 pt-6">
                {post.categories.map((c) => (
                  <Link
                    key={c}
                    href={`/topics/${slugifyLabel(c)}`}
                    className="rounded-full bg-cream-100 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                  >
                    #{c}
                  </Link>
                ))}
              </div>
            )}

            <AuthorBox />

            <div className="rounded-[var(--radius-card)] border border-cream-200 bg-cream-100/50 p-5 text-sm leading-relaxed text-ink-500">
              <strong className="text-emerald-800">A gentle note:</strong> Sabr and Sukoon
              shares faith-based reflection, not medical or psychological treatment. If you
              are struggling, please also reach out to a qualified professional.{" "}
              <Link href="/disclaimer" className="text-emerald-700 underline">
                Read our full disclaimer
              </Link>
              .
            </div>
          </div>

          {/* Desktop sticky table of contents */}
          {toc.length > 0 && (
            <aside className="hidden lg:block">
              <TableOfContents items={toc} />
            </aside>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
          <h2 className="font-serif text-2xl font-semibold text-emerald-900">
            Continue reflecting
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
