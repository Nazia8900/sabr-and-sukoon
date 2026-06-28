import Link from "next/link";

export default function Pagination({
  page,
  totalPages,
  basePath = "/blog",
}: {
  page: number;
  totalPages: number;
  basePath?: string;
}) {
  if (totalPages <= 1) return null;
  const href = (p: number) => (p <= 1 ? basePath : `${basePath}?page=${p}`);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 && (
        <Link
          href={href(page - 1)}
          className="rounded-lg border border-cream-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
        >
          ← Prev
        </Link>
      )}
      {pages.map((p, i) => {
        const gap = i > 0 && p - pages[i - 1] > 1;
        return (
          <span key={p} className="flex items-center gap-2">
            {gap && <span className="text-ink-400">…</span>}
            <Link
              href={href(p)}
              aria-current={p === page ? "page" : undefined}
              className={
                p === page
                  ? "rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                  : "rounded-lg border border-cream-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
              }
            >
              {p}
            </Link>
          </span>
        );
      })}
      {page < totalPages && (
        <Link
          href={href(page + 1)}
          className="rounded-lg border border-cream-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
        >
          Next →
        </Link>
      )}
    </nav>
  );
}
