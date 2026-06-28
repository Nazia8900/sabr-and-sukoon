"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PostMeta } from "@/lib/posts";
import { slugifyLabel } from "@/lib/slug";
import Chip from "@/components/Chip";
import PostCard from "./PostCard";

const PER_PAGE = 12;

type TopicChip = { name: string; slug: string };

function Explorer({ posts, topics }: { posts: PostMeta[]; topics: readonly TopicChip[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [visible, setVisible] = useState(PER_PAGE);

  // Keep the URL in sync (debounced) so a search is shareable / bookmarkable.
  useEffect(() => {
    const t = setTimeout(() => {
      const sp = new URLSearchParams();
      if (query.trim()) sp.set("q", query.trim());
      const qs = sp.toString();
      router.replace(qs ? `/blog?${qs}` : "/blog", { scroll: false });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const isSearching = terms.length > 0;
  const isFiltering = activeTopic !== null || isSearching;

  const results = useMemo(() => {
    // 1. Category filter (matches /topics/[slug]): topic AND query are composable.
    const base = activeTopic
      ? posts.filter((p) => p.categories.some((c) => slugifyLabel(c) === activeTopic))
      : posts;

    if (!terms.length) return base;

    // 2. Free-text scoring pass: title match > category match > excerpt match.
    // Every term must appear somewhere (AND semantics); rank by where it hit.
    const scored: { post: PostMeta; score: number }[] = [];
    for (const p of base) {
      const title = p.title.toLowerCase();
      const cats = p.categories.join(" ").toLowerCase();
      const excerpt = p.excerpt.toLowerCase();
      const author = p.author.toLowerCase();

      let score = 0;
      let matchedAll = true;
      for (const term of terms) {
        const inTitle = title.includes(term);
        const inCats = cats.includes(term);
        const inExcerpt = excerpt.includes(term);
        const inAuthor = author.includes(term);
        if (!inTitle && !inCats && !inExcerpt && !inAuthor) {
          matchedAll = false;
          break;
        }
        if (inTitle) score += 10;
        else if (inCats) score += 5;
        else if (inExcerpt) score += 2;
        else score += 1; // author-only
      }
      if (matchedAll) scored.push({ post: p, score });
    }

    // Stable sort: higher score first, otherwise keep original (newest-first) order.
    return scored
      .map((s, i) => ({ ...s, i }))
      .sort((a, b) => b.score - a.score || a.i - b.i)
      .map((s) => s.post);
  }, [posts, activeTopic, query]);

  // When narrowing the set, always show everything that matched so nothing is
  // hidden behind "Load more"; only the default browse view paginates.
  const shown = isFiltering ? results : results.slice(0, visible);
  const canLoadMore = !isFiltering && visible < results.length;

  const activeTopicName = activeTopic
    ? topics.find((t) => t.slug === activeTopic)?.name ?? null
    : null;

  function clearAll() {
    setQuery("");
    setActiveTopic(null);
    setVisible(PER_PAGE);
  }

  return (
    <div>
      {/* Search bar */}
      <div className="mx-auto max-w-2xl">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(PER_PAGE);
            }}
            placeholder="Search articles — try “anxiety”, “tawakkul”, “heartbreak”…"
            aria-label="Search articles"
            className="w-full rounded-full border border-cream-200 bg-white py-3.5 pl-12 pr-12 text-sm shadow-sm outline-none transition-colors focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setVisible(PER_PAGE);
              }}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-cream-100 hover:text-emerald-700"
            >
              <CloseIcon />
            </button>
          )}
        </div>

        {/* Quick topic filters (real category filter, composable with search) */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {topics.map((t) => {
            const active = activeTopic === t.slug;
            return (
              <Chip
                key={t.slug}
                size="sm"
                active={active}
                onClick={() => {
                  setActiveTopic(active ? null : t.slug);
                  setVisible(PER_PAGE);
                }}
              >
                {t.name}
              </Chip>
            );
          })}
        </div>
      </div>

      {/* Result count */}
      <p className="mt-8 text-center text-sm text-ink-500" aria-live="polite">
        {isFiltering ? (
          <>
            <span className="font-semibold text-emerald-700">{results.length}</span>{" "}
            {results.length === 1 ? "article" : "articles"}
            {activeTopicName ? (
              <>
                {" "}
                in <span className="font-medium text-emerald-700">{activeTopicName}</span>
              </>
            ) : null}
            {isSearching ? <> matching “{query.trim()}”</> : null}
          </>
        ) : (
          <>
            Showing {shown.length} of {results.length} articles
          </>
        )}
      </p>

      {/* Results grid */}
      {shown.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p, i) => (
            <PostCard key={p.slug} post={p} priority={i < 3} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-[var(--radius-card)] border border-dashed border-cream-200 bg-white p-12 text-center">
          <p className="font-arabic text-3xl text-emerald-600/60">سكون</p>
          <p className="mt-3 font-serif text-lg text-emerald-900">
            {isSearching ? (
              <>No articles matched “{query.trim()}”</>
            ) : (
              <>No articles in this topic yet</>
            )}
          </p>
          <p className="mt-1 text-sm text-ink-500">
            Try a broader word, or browse a topic above.
          </p>
          <button
            onClick={clearAll}
            className="mt-5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Load more (default, unfiltered view) */}
      {canLoadMore && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => setVisible((v) => v + PER_PAGE)}
            className="rounded-full border border-emerald-300 bg-white px-7 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
          >
            Load more articles
          </button>
        </div>
      )}
    </div>
  );
}

export default function ArticlesExplorer(props: {
  posts: PostMeta[];
  topics: readonly TopicChip[];
}) {
  return (
    <Suspense fallback={<div className="mt-8 text-center text-ink-400">Loading…</div>}>
      <Explorer {...props} />
    </Suspense>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}
