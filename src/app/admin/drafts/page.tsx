import Link from "next/link";
import { listDrafts } from "@/lib/drafts";
import { storeMode } from "@/lib/content-store";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Automation queue",
  robots: { index: false, follow: false },
};

export default async function AutomationQueuePage() {
  const drafts = await listDrafts();
  const store = storeMode();

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-emerald-900">
        Automation queue
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-500">
        Posts sent in by the automation engine land here as drafts. Nothing reaches the
        site until you open it and approve it. Storing to {store.label}.
      </p>

      {drafts.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-card)] border border-dashed border-cream-300 bg-white p-10 text-center text-ink-400">
          <p className="text-emerald-900">Nothing waiting for review.</p>
          <p className="mt-2 text-sm">
            Automated posts arrive via{" "}
            <code className="rounded bg-cream-100 px-1.5 py-0.5">POST /api/ingest</code>.
            To write one yourself, use{" "}
            <Link href="/admin/posts/new" className="text-emerald-700 underline">
              Write a new post
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="mt-6 overflow-hidden rounded-[var(--radius-card)] border border-cream-200 bg-white">
          {drafts.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between gap-4 border-b border-cream-200 p-4 last:border-b-0"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/drafts/${d.id}`}
                  className="font-medium text-emerald-900 hover:text-emerald-700"
                >
                  {d.title}
                </Link>
                <p className="mt-0.5 truncate text-xs text-ink-400">
                  {d.source} · {formatDate(d.createdAt)} ·{" "}
                  {d.categories.slice(0, 3).join(", ") || "no topics"}
                </p>
              </div>
              <Link
                href={`/admin/drafts/${d.id}`}
                className="shrink-0 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Review →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
