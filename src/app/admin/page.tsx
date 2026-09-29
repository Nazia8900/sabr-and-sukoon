import Link from "next/link";
import { listDrafts } from "@/lib/drafts";
import { listEditorPosts } from "@/lib/editor-posts";
import { storeMode } from "@/lib/content-store";
import { getAllTopics } from "@/lib/topics";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [drafts, posts, topics] = await Promise.all([
    listDrafts(),
    listEditorPosts(),
    getAllTopics(),
  ]);
  const store = storeMode();

  const published = posts.filter((p) => p.status === "published");
  const unpublished = posts.filter((p) => p.status === "draft");
  const recent = posts.slice(0, 5);

  return (
    <div>
      {/* Primary action */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-card)] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-cream-50 p-6">
        <div>
          <h1 className="font-serif text-xl font-semibold text-emerald-900">
            Salaam, Nazia
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {published.length} articles live. Write another whenever you are ready.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Write a new post
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Published" value={published.length} href="/admin/posts" accent />
        <Stat label="Drafts" value={unpublished.length} href="/admin/posts" />
        <Stat label="Awaiting review" value={drafts.length} href="/admin/drafts" />
        <Stat label="Topics" value={topics.length} href="/topics" />
      </div>

      {/* Recent posts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-serif text-lg font-semibold text-emerald-900">
              Recently updated
            </h2>
            <Link href="/admin/posts" className="text-sm text-emerald-700 hover:underline">
              See all
            </Link>
          </div>
          <ul className="overflow-hidden rounded-[var(--radius-card)] border border-cream-200 bg-white">
            {recent.map((p) => (
              <li
                key={p.slug}
                className="flex items-center justify-between gap-3 border-b border-cream-200 px-4 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/posts/${p.slug}`}
                    className="font-medium text-emerald-900 hover:text-emerald-700"
                  >
                    {p.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-ink-400">
                    {formatDate(p.publishedAt) || "No date"}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    p.status === "published"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gold-300/40 text-gold-600"
                  }`}
                >
                  {p.status}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Housekeeping */}
        <aside className="space-y-4">
          <div className="rounded-[var(--radius-card)] border border-cream-200 bg-white p-5">
            <h2 className="font-serif text-base font-semibold text-emerald-900">
              Your content
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              Posts are saved to <strong>{store.label}</strong>. Download a complete copy
              of every article any time.
            </p>
            <a
              href="/api/admin/export"
              className="mt-3 inline-block rounded-full border border-cream-300 px-4 py-2 text-xs font-semibold text-ink-500 hover:bg-cream-100"
            >
              Export all posts
            </a>
          </div>

          {drafts.length > 0 && (
            <div className="rounded-[var(--radius-card)] border border-gold-300 bg-gold-300/10 p-5">
              <h2 className="font-serif text-base font-semibold text-emerald-900">
                {drafts.length} waiting for review
              </h2>
              <p className="mt-2 text-sm text-ink-500">
                The automation engine sent these in. They are not on the site yet.
              </p>
              <Link
                href="/admin/drafts"
                className="mt-3 inline-block rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Review them
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: string | number;
  href: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-[var(--radius-card)] border p-5 transition-shadow hover:shadow-[var(--shadow-card)] ${
        accent ? "border-emerald-200 bg-emerald-50" : "border-cream-200 bg-white"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-1 font-serif text-3xl font-semibold text-emerald-900">{value}</p>
    </Link>
  );
}
