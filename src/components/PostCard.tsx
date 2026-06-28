import Link from "next/link";
import Image from "next/image";
import type { PostMeta } from "@/lib/posts";
import { slugifyLabel } from "@/lib/slug";
import { formatDate } from "@/lib/format";
import Chip from "@/components/Chip";

// Rotated Arabic motifs for image-less cards so they don't all look identical.
const FALLBACK_WORDS = ["سكون", "صبر", "رحمة", "نور"] as const;

function fallbackWord(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_WORDS[hash % FALLBACK_WORDS.length];
}

export default function PostCard({
  post,
  priority = false,
}: {
  post: PostMeta;
  priority?: boolean;
}) {
  const category = post.categories[0];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-cream-200 bg-white shadow-[var(--shadow-card)] transition duration-300 motion-safe:hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]">
      <div className="relative block aspect-[16/10] overflow-hidden bg-emerald-50">
        {post.cover ? (
          <Image
            src={post.cover}
            alt={post.title}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-200">
            <span className="font-arabic text-4xl text-emerald-700/40" aria-hidden="true">
              {fallbackWord(post.slug)}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {category && (
          <div className="relative z-10 mb-3">
            <Chip intent="gold" size="sm" href={`/topics/${slugifyLabel(category)}`}>
              {category}
            </Chip>
          </div>
        )}
        <h3 className="font-serif text-lg font-semibold leading-snug text-emerald-900">
          {/* Stretched link: the ::before overlay makes the whole card clickable
              with a single keyboard-focusable target. */}
          <Link
            href={`/blog/${post.slug}`}
            className="clamp-2 transition-colors before:absolute before:inset-0 before:z-0 before:content-[''] group-hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2"
          >
            {post.title}
          </Link>
        </h3>
        <p className="clamp-3 mt-2 text-sm leading-relaxed text-ink-500">{post.excerpt}</p>
        <div className="mt-4 flex items-center gap-1.5 border-t border-cream-100 pt-3 text-xs text-ink-400">
          {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
          {post.publishedAt && <span aria-hidden="true">·</span>}
          <span>{post.readingMinutes} min read</span>
        </div>
      </div>
    </article>
  );
}
