import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { site } from "@/lib/site";
import { getAllPostMeta } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import JsonLd from "@/components/JsonLd";
import { personLd, breadcrumbLd } from "@/lib/seo";

export const revalidate = 3600;

export function generateStaticParams() {
  return [{ slug: site.author.slug }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== site.author.slug) return { title: "Author not found" };
  return {
    title: `${site.author.name} — ${site.author.role}`,
    description: site.author.bio,
    alternates: { canonical: `/author/${site.author.slug}` },
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug !== site.author.slug) notFound();
  const a = site.author;
  const posts = getAllPostMeta().filter(
    (p) => p.author === a.name || p.author === "The sukoon seeker"
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <JsonLd
        data={[
          personLd(),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: a.name, path: `/author/${a.slug}` },
          ]),
        ]}
      />
      <header className="flex flex-col items-center gap-6 rounded-[var(--radius-card)] border border-cream-200 bg-cream-100/60 p-8 text-center sm:flex-row sm:text-left">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-emerald-700 font-serif text-4xl text-cream-50">
          {a.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">
            {a.role}
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-emerald-900">{a.name}</h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-ink-500">{a.bio}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm sm:justify-start">
            <a href={site.socials.youtube} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-900">YouTube</a>
            <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-900">Instagram</a>
            <a href={`mailto:${a.email}`} className="text-emerald-700 hover:text-emerald-900">Email</a>
          </div>
        </div>
      </header>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold text-emerald-900">
          Articles by {a.name}
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
        {posts.length === 0 && (
          <p className="mt-4 text-ink-500">
            No articles yet. <Link href="/blog" className="text-emerald-700 underline">Browse all</Link>.
          </p>
        )}
      </section>
    </div>
  );
}
