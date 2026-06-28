export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

/** Renders the nested list of heading links shared by both layouts. */
function TocList({ items, idPrefix }: { items: TocItem[]; idPrefix: string }) {
  return (
    <ul className="space-y-1 text-sm">
      {items.map((item, i) => (
        <li key={`${idPrefix}-${item.id}-${i}`} className={item.level === 3 ? "ml-3" : ""}>
          <a
            href={`#${item.id}`}
            className="block rounded-[var(--radius-sm)] px-2 py-1 text-ink-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/50"
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Table of contents built server-side from a post's h2/h3 headings.
 * Renders as a sticky sidebar on lg+ and a collapsible <details> on mobile.
 * The caller is responsible for skipping render when there are too few items.
 */
export default function TableOfContents({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;

  return (
    <>
      {/* Mobile / tablet: collapsible disclosure inline above the prose */}
      <details className="group mb-8 rounded-[var(--radius-card)] border border-cream-200 bg-cream-100/50 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 font-serif text-sm font-semibold text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/50">
          <span>In this reflection</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4 shrink-0 text-emerald-600 transition-transform group-open:rotate-180"
          >
            <path
              d="m5 7.5 5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </summary>
        <nav aria-label="Table of contents" className="px-2 pb-3">
          <TocList items={items} idPrefix="m" />
        </nav>
      </details>

      {/* Desktop: sticky sidebar */}
      <nav
        aria-label="Table of contents"
        className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto"
      >
        <p className="gold-rule mb-3 font-serif text-xs font-semibold uppercase tracking-wide text-emerald-800">
          In this reflection
        </p>
        <TocList items={items} idPrefix="d" />
      </nav>
    </>
  );
}
