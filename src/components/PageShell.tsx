export default function PageShell({
  title,
  intro,
  children,
  updated,
}: {
  title: string;
  intro?: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Inner-page header: lighter & cleaner than the home hero —
          a soft cream wash with a faint star texture and a gold rule. */}
      <div className="star-texture border-b border-cream-200 bg-gradient-to-b from-cream-50 to-cream-100/40">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <h1 className="gold-rule font-serif text-4xl font-semibold text-emerald-900">
            {title}
          </h1>
          {intro && <p className="mt-4 text-lg text-ink-500">{intro}</p>}
          {updated && (
            <p className="mt-3 text-sm text-ink-400">Last updated: {updated}</p>
          )}
        </div>
      </div>
      <div className="bg-cream-50">
        <div className="prose mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
