"use client";

/** Searchable, filterable list of every post the admin can open. */
import { useMemo, useState } from "react";
import Link from "next/link";
import type { EditorListItem } from "@/lib/editor-posts";
import { formatDate } from "@/lib/format";

type Filter = "all" | "published" | "draft";

export default function PostFilter({ posts }: { posts: EditorListItem[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const results = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return posts.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (!terms.length) return true;
      const haystack = `${p.title} ${p.slug} ${p.categories.join(" ")}`.toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
  }, [posts, query, filter]);

  const counts = useMemo(
    () => ({
      all: posts.length,
      published: posts.filter((p) => p.status === "published").length,
      draft: posts.filter((p) => p.status === "draft").length,
    }),
    [posts]
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, slug or topic…"
          className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-cream-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400"
        />
        <div className="flex gap-1 rounded-full border border-cream-300 bg-white p-1">
          {(["all", "published", "draft"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                filter === f
                  ? "bg-emerald-600 text-white"
                  : "text-ink-500 hover:text-emerald-700"
              }`}
            >
              {f} ({counts[f]})
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-cream-300 bg-white p-10 text-center text-ink-400">
          <p>Nothing matches that.</p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-[var(--radius-card)] border border-cream-200 bg-white">
          {results.map((p) => (
            <li
              key={p.slug}
              className="flex items-center justify-between gap-4 border-b border-cream-200 px-4 py-3 last:border-b-0 hover:bg-cream-50"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/posts/${p.slug}`}
                  className="font-medium text-emerald-900 hover:text-emerald-700"
                >
                  {p.title}
                </Link>
                <p className="mt-0.5 truncate text-xs text-ink-400">
                  {formatDate(p.publishedAt) || "No date"} ·{" "}
                  {p.categories.slice(0, 3).join(", ") || "no topics"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {p.origin === "migrated" && (
                  <span
                    title="Still the original file migrated from Blogger"
                    className="hidden rounded-full bg-cream-100 px-2 py-0.5 text-[11px] text-ink-400 sm:inline"
                  >
                    migrated
                  </span>
                )}
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    p.status === "published"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gold-300/40 text-gold-600"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
