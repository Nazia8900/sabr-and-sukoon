/** Loading placeholder matching PostCard's shape, for route loading.tsx files. */
export default function PostCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-cream-200 bg-white">
      <div className="aspect-[16/10] animate-pulse bg-emerald-50" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-20 animate-pulse rounded bg-cream-200" />
        <div className="h-5 w-full animate-pulse rounded bg-cream-200" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-cream-200" />
        <div className="h-3 w-full animate-pulse rounded bg-cream-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-cream-100" />
      </div>
    </div>
  );
}

export function PostGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
