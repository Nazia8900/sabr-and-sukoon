import { PostGridSkeleton } from "@/components/PostCardSkeleton";

/** Loading placeholder for a topic page: centered header + post grid. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      {/* Header skeleton — mirrors the real topic header layout */}
      <header className="mb-10 flex flex-col items-center text-center">
        <div className="h-3 w-16 animate-pulse rounded bg-gold-300/40" />
        <div className="mt-4 h-9 w-64 max-w-full animate-pulse rounded bg-cream-200" />
        <div className="mt-4 h-3 w-24 animate-pulse rounded bg-cream-100" />
      </header>

      <PostGridSkeleton />
    </div>
  );
}
