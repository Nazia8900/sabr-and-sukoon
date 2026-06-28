import Link from "next/link";
import Image from "next/image";
import { getAllPostMeta } from "@/lib/posts";
import { slugifyLabel } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Chip from "@/components/Chip";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default function HomePage() {
  const posts = getAllPostMeta();
  const topics = site.featuredTopics;
  const [hero, ...rest] = posts;
  const featured = rest.slice(0, 2);
  const latest = rest.slice(2, 11);

  return (
    <>
      {/* Hero */}
      <section className="star-texture relative overflow-hidden border-b border-cream-200 bg-gradient-to-b from-emerald-50 to-cream-50">
        {/* Soft emerald radial glow behind the H1 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/3 -z-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/30 blur-[90px] sm:h-96 sm:w-96"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="gold-rule inline-block font-arabic text-2xl text-emerald-700 [&::after]:mx-auto">
              صبر و سکون
            </p>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-emerald-900 sm:text-5xl">
              Where Islamic wisdom meets inner peace
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-500">
              Faith-based reflections rooted in Quran and authentic Hadith — gentle
              guidance for the anxious, the overwhelmed, and every heart finding its
              way back to Allah.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/blog"
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                Read the articles
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-emerald-300 bg-white px-6 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
              >
                Our story
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {/* Featured hero post */}
        {hero && (
          <section className="mb-16 grid gap-8 lg:grid-cols-2">
            <Link
              href={`/blog/${hero.slug}`}
              className="group relative block aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] bg-emerald-100"
            >
              {hero.cover ? (
                <Image
                  src={hero.cover}
                  alt={hero.title}
                  fill
                  priority
                  sizes="(max-width:1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-arabic text-5xl text-emerald-600/40">
                  سكون
                </div>
              )}
            </Link>
            <div className="flex flex-col justify-center">
              <span className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                Latest reflection
              </span>
              {hero.categories[0] && (
                <Link
                  href={`/topics/${slugifyLabel(hero.categories[0])}`}
                  className="mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-800"
                >
                  {hero.categories[0]}
                </Link>
              )}
              <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-emerald-900">
                <Link href={`/blog/${hero.slug}`} className="hover:text-emerald-700">
                  {hero.title}
                </Link>
              </h2>
              <p className="mt-3 leading-relaxed text-ink-500">{hero.excerpt}</p>
              <p className="mt-4 text-sm text-ink-400">{formatDate(hero.publishedAt)}</p>
              <Link
                href={`/blog/${hero.slug}`}
                className="mt-5 inline-flex w-fit items-center gap-1 text-sm font-semibold text-emerald-700 hover:gap-2"
              >
                Continue reading →
              </Link>
            </div>
          </section>
        )}

        {/* Featured pair */}
        {featured.length > 0 && (
          <section className="mb-16 grid gap-6 sm:grid-cols-2">
            {featured.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </section>
        )}

        {/* Topics strip */}
        {topics.length > 0 && (
          <section className="mb-16">
            <h2 className="gold-rule font-serif text-2xl font-semibold text-emerald-900">
              Explore by topic
            </h2>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {topics.map((t) => (
                <Chip key={t.slug} href={`/topics/${t.slug}`} intent="outline">
                  {t.name}
                </Chip>
              ))}
            </div>
          </section>
        )}

        {/* Latest grid */}
        <section>
          <div className="flex items-end justify-between">
            <h2 className="gold-rule font-serif text-2xl font-semibold text-emerald-900">
              Latest articles
            </h2>
            <Link href="/blog" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">
              View all →
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>

        {/* Trust band */}
        <section className="mt-20 rounded-[var(--radius-card)] bg-emerald-900 px-6 py-12 text-center text-cream-100">
          <p className="font-arabic text-2xl text-gold-300">وَنُنَزِّلُ مِنَ ٱلْقُرْآنِ مَا هُوَ شِفَآءٌ</p>
          <p className="mx-auto mt-4 max-w-xl text-emerald-100/80">
            “And We send down of the Quran that which is a healing and a mercy.”
            <span className="block text-sm text-emerald-100/50">— Surah Al-Isra 17:82</span>
          </p>
          <div className="mt-7 flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-emerald-100/70">
              Walk with us for gentle, faith-rooted reminders
            </p>
            <div className="flex items-center justify-center gap-3">
              <a
                href={site.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Sabr and Sukoon on YouTube"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-800 text-cream-100 transition-colors hover:bg-gold-400 hover:text-emerald-900"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23 12s0-3.8-.5-5.6a2.9 2.9 0 0 0-2-2C18.7 4 12 4 12 4s-6.7 0-8.5.4a2.9 2.9 0 0 0-2 2C1 8.2 1 12 1 12s0 3.8.5 5.6a2.9 2.9 0 0 0 2 2C5.3 20 12 20 12 20s6.7 0 8.5-.4a2.9 2.9 0 0 0 2-2C23 15.8 23 12 23 12zM10 15.5v-7l6 3.5-6 3.5z" />
                </svg>
              </a>
              <a
                href={site.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Sabr and Sukoon on Instagram"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-800 text-cream-100 transition-colors hover:bg-gold-400 hover:text-emerald-900"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.1.4.3 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.1-1 .3-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.9-1.4c-.1-.4-.3-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.1 1-.3 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.4-1.3.8-.4.4-.6.8-.8 1.3-.2.4-.3 1-.4 2.1C2.6 9.5 2.6 9.9 2.6 13s0 3.5.1 4.7c.1 1.1.2 1.7.4 2.1.2.5.4.9.8 1.3.4.4.8.6 1.3.8.4.2 1 .3 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.3-.8.4-.4.6-.8.8-1.3.2-.4.3-1 .4-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.4-2.1a3.5 3.5 0 0 0-.8-1.3 3.5 3.5 0 0 0-1.3-.8c-.4-.2-1-.3-2.1-.4-1.2-.1-1.6-.1-4.7-.1zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 8a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2zm6.3-8.2a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0z" />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
