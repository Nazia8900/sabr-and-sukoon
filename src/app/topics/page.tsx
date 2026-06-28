import type { Metadata } from "next";
import { getAllTopics, getSubstantialTopics, getTopic } from "@/lib/topics";
import Chip from "@/components/Chip";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Topics",
  description: `Browse all topics on ${site.name} — from tawakkul and sabr to anxiety, heartbreak and Islamic psychology.`,
  alternates: { canonical: "/topics" },
};

export default function TopicsPage() {
  const allTopics = getAllTopics();
  const substantial = getSubstantialTopics(3);

  // Slugs already surfaced as pillars or in the main cloud — so the
  // "All tags" disclosure only carries the genuine long tail.
  const surfaced = new Set<string>([
    ...site.featuredTopics.map((t) => t.slug),
    ...substantial.map((t) => t.slug),
  ]);
  const longTail = allTopics.filter((t) => !surfaced.has(t.slug));

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <header className="mb-12 text-center">
        <h1 className="gold-rule mx-auto inline-block font-serif text-4xl font-semibold text-emerald-900">
          Topics
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-ink-500">
          {allTopics.length} themes across our reflections — start with the
          pillars below, then explore the wider collection.
        </p>
      </header>

      {/* Pillars — curated, prominent entry points */}
      <section className="mb-12">
        <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-gold-500">
          Start here
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {site.featuredTopics.map((t, i) => {
            // Resolve the real label/count where available; fall back to config.
            const topic = getTopic(t.slug);
            return (
              <Chip
                key={t.slug}
                href={`/topics/${t.slug}`}
                intent={i % 2 === 0 ? "solid" : "gold"}
                size="md"
              >
                {topic?.name ?? t.name}
              </Chip>
            );
          })}
        </div>
      </section>

      {/* Main cloud — substantial topics with post counts */}
      {substantial.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Explore by theme
          </h2>
          <div className="flex flex-wrap justify-center gap-2.5">
            {substantial.map((t) => (
              <Chip
                key={t.slug}
                href={`/topics/${t.slug}`}
                intent="outline"
                size="md"
                count={t.count}
              >
                {t.name}
              </Chip>
            ))}
          </div>
        </section>
      )}

      {/* Long tail — collapsed disclosure to keep the page calm */}
      {longTail.length > 0 && (
        <details className="group mx-auto mt-4 max-w-4xl rounded-[var(--radius-card)] border border-cream-200 bg-white/60">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-[var(--radius-card)] px-5 py-4 font-medium text-emerald-800 transition-colors hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500">
            <span>
              All tags
              <span className="ml-1.5 text-ink-400">({longTail.length})</span>
            </span>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 shrink-0 text-emerald-500 transition-transform motion-safe:duration-200 group-open:rotate-180"
            >
              <path d="m5 7.5 5 5 5-5" />
            </svg>
          </summary>
          <div className="flex flex-wrap gap-2 px-5 pb-5 pt-1">
            {longTail.map((t) => (
              <Chip
                key={t.slug}
                href={`/topics/${t.slug}`}
                intent="soft"
                size="sm"
                count={t.count}
              >
                {t.name}
              </Chip>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
