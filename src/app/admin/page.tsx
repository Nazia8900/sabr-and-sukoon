import Link from "next/link";
import { listDrafts } from "@/lib/drafts";
import { getAllPosts } from "@/lib/posts";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  const drafts = listDrafts();
  const published = getAllPosts().length;

  return (
    <div>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Pending drafts" value={drafts.length} accent />
        <Stat label="Published articles" value={published} />
        <Stat label="Ingest endpoint" value="/api/ingest" small />
      </div>

      <h2 className="font-serif text-xl font-semibold text-emerald-900">Review queue</h2>
      <p className="mt-1 text-sm text-ink-500">
        Drafts arrive here from the automation engine. Nothing is published until you
        approve it.
      </p>

      {drafts.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-card)] border border-dashed border-cream-200 bg-white p-10 text-center text-ink-400">
          <p>No drafts waiting. 🎉</p>
          <p className="mt-2 text-sm">
            Send a draft via{" "}
            <code className="rounded bg-cream-100 px-1.5 py-0.5">POST /api/ingest</code>.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {drafts.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between rounded-[var(--radius-card)] border border-cream-200 bg-white p-4"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/drafts/${d.id}`}
                  className="font-medium text-emerald-900 hover:text-emerald-700"
                >
                  {d.title}
                </Link>
                <p className="mt-0.5 text-xs text-ink-400">
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

function Stat({
  label,
  value,
  accent,
  small,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border p-5 ${
        accent ? "border-emerald-200 bg-emerald-50" : "border-cream-200 bg-white"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
      <p
        className={`mt-1 font-serif font-semibold text-emerald-900 ${
          small ? "text-base" : "text-3xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
