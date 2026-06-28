import { PostGridSkeleton } from "@/components/PostCardSkeleton";

/** Loading placeholder for a single post: header skeleton + related grid. */
export default function Loading() {
  return (
    <div className="pb-10">
      {/* Header skeleton — mirrors the real post header layout */}
      <header className="border-b border-cream-200 bg-gradient-to-b from-emerald-50 to-cream-50">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="mb-4 h-3 w-32 animate-pulse rounded bg-cream-200" />
          <div className="h-3 w-24 animate-pulse rounded bg-emerald-100" />
          <div className="mt-4 space-y-3">
            <div className="h-8 w-full animate-pulse rounded bg-cream-200" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-cream-200" />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="h-3 w-28 animate-pulse rounded bg-cream-200" />
            <div className="h-3 w-24 animate-pulse rounded bg-cream-100" />
            <div className="h-3 w-20 animate-pulse rounded bg-cream-100" />
          </div>
        </div>
      </header>

      {/* Body skeleton */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mt-10 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`h-4 animate-pulse rounded bg-cream-100 ${
                i % 4 === 3 ? "w-2/3" : "w-full"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Related skeleton */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <div className="mb-6 h-7 w-48 animate-pulse rounded bg-cream-200" />
        <PostGridSkeleton count={3} />
      </section>
    </div>
  );
}
