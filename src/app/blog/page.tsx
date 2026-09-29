import type { Metadata } from "next";
import { getAllPostMeta } from "@/lib/posts";
import ArticlesExplorer from "@/components/ArticlesExplorer";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All Articles",
  description: `Browse and search every reflection from ${site.name} — Quran, Hadith and Islamic psychology for inner peace.`,
  alternates: { canonical: "/blog" },
};

export default async function BlogIndex() {
  const posts = await getAllPostMeta();
  // Curated pillars (slug-based) drive the chip set — these match /topics/[slug].
  const topics = site.featuredTopics;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Articles", path: "/blog" },
        ])}
      />
      <header className="mb-8 text-center">
        <h1 className="font-serif text-4xl font-semibold text-emerald-900">All Articles</h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-500">
          {posts.length} reflections bridging Quranic wisdom and modern psychology. Search
          or filter to find what your heart needs.
        </p>
      </header>

      <ArticlesExplorer posts={posts} topics={topics} />
    </div>
  );
}
