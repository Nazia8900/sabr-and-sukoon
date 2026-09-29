import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostsByCategorySlug } from "@/lib/posts";
import { getAllTopics, getTopic, getSubstantialTopics } from "@/lib/topics";
import PostCard from "@/components/PostCard";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";
import { site } from "@/lib/site";

// Publishing calls revalidatePath, so changes appear immediately; this hourly
// revalidate is only a backstop in case an on-demand refresh is ever missed.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  // Pre-render the substantial topics; the rest render on demand.
  return (await getSubstantialTopics(2)).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getTopic(slug);
  // Served with a 200 by Next despite rendering the not-found page, so make it
  // explicitly non-indexable rather than let a soft 404 into the search index.
  if (!topic)
    return { title: "Topic not found", robots: { index: false, follow: false } };
  return {
    title: `${topic.name}`,
    description: `${topic.count} articles on ${topic.name} from ${site.name}.`,
    alternates: { canonical: `/topics/${topic.slug}` },
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = await getTopic(slug);
  if (!topic) notFound();
  const posts = await getPostsByCategorySlug(slug);
  const count = posts.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Topics", path: "/topics" },
          { name: topic.name, path: `/topics/${topic.slug}` },
        ])}
      />
      <header className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">Topic</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-emerald-900">{topic.name}</h1>
        <p className="mt-3 text-ink-500">
          {count} {count === 1 ? "article" : "articles"}
        </p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </div>
  );
}
