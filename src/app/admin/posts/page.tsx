import Link from "next/link";
import { listEditorPosts } from "@/lib/editor-posts";
import { storeMode } from "@/lib/content-store";
import PostFilter from "@/components/admin/PostFilter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All posts",
  robots: { index: false, follow: false },
};

export default async function AdminPostsPage() {
  const posts = await listEditorPosts();
  const store = storeMode();
  const published = posts.filter((p) => p.status === "published").length;
  const drafts = posts.length - published;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-emerald-900">
            All posts
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {published} published · {drafts} draft{drafts === 1 ? "" : "s"} · saving to{" "}
            {store.label}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/admin/export"
            className="rounded-full border border-cream-300 bg-white px-4 py-2 text-sm font-semibold text-ink-500 hover:bg-cream-100"
          >
            Export all
          </a>
          <Link
            href="/admin/posts/new"
            className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Write a new post
          </Link>
        </div>
      </div>

      <PostFilter posts={posts} />
    </div>
  );
}
