import Link from "next/link";
import { site } from "@/lib/site";
import Logo from "./Logo";

export default function Footer({ topics }: { topics?: { name: string; slug: string }[] }) {
  const year = new Date().getFullYear();
  // Prefer the curated pillars; fall back to the optional prop for backward-compat.
  const footerTopics = site.featuredTopics.length ? site.featuredTopics : topics ?? [];
  return (
    <footer className="mt-20 border-t border-cream-200 bg-emerald-900 text-cream-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <Logo className="h-10 w-10" />
            <span className="font-serif text-xl font-semibold text-cream-50">
              {site.name}
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-emerald-100/80">
            {site.description}
          </p>
          <p className="mt-4 text-sm text-emerald-100/70 italic">
            “May Allah grant us all Sabr in our struggles and Sukoon in our hearts.”
          </p>
          <div className="mt-5 flex gap-3">
            <SocialLink href={site.socials.youtube} label="YouTube">
              <path d="M23 12s0-3.8-.5-5.6a2.9 2.9 0 0 0-2-2C18.7 4 12 4 12 4s-6.7 0-8.5.4a2.9 2.9 0 0 0-2 2C1 8.2 1 12 1 12s0 3.8.5 5.6a2.9 2.9 0 0 0 2 2C5.3 20 12 20 12 20s6.7 0 8.5-.4a2.9 2.9 0 0 0 2-2C23 15.8 23 12 23 12zM10 15.5v-7l6 3.5-6 3.5z" />
            </SocialLink>
            <SocialLink href={site.socials.instagram} label="Instagram">
              <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.1.4.3 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.1-1 .3-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.9-1.4c-.1-.4-.3-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.1 1-.3 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.4-1.3.8-.4.4-.6.8-.8 1.3-.2.4-.3 1-.4 2.1C2.6 9.5 2.6 9.9 2.6 13s0 3.5.1 4.7c.1 1.1.2 1.7.4 2.1.2.5.4.9.8 1.3.4.4.8.6 1.3.8.4.2 1 .3 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.3-.8.4-.4.6-.8.8-1.3.2-.4.3-1 .4-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.4-2.1a3.5 3.5 0 0 0-.8-1.3 3.5 3.5 0 0 0-1.3-.8c-.4-.2-1-.3-2.1-.4-1.2-.1-1.6-.1-4.7-.1zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 8a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2zm6.3-8.2a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0z" />
            </SocialLink>
          </div>
        </div>

        <div>
          <h4 className="font-serif text-sm font-semibold tracking-wide text-cream-50">
            Explore
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-emerald-100/80">
            {site.nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-gold-300">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/editorial-policy" className="hover:text-gold-300">
                Editorial Policy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-sm font-semibold tracking-wide text-cream-50">
            {footerTopics.length ? "Popular Topics" : "Legal"}
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-emerald-100/80">
            {footerTopics.slice(0, 6).map((t) => (
              <li key={t.slug}>
                <Link href={`/topics/${t.slug}`} className="hover:text-gold-300">
                  {t.name}
                </Link>
              </li>
            ))}
            {footerTopics.length ? (
              <li>
                <Link
                  href="/topics"
                  className="font-medium text-gold-300 hover:text-gold-400"
                >
                  View all topics →
                </Link>
              </li>
            ) : null}
            <li>
              <Link href="/privacy-policy" className="hover:text-gold-300">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/disclaimer" className="hover:text-gold-300">
                Disclaimer
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-gold-300">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-emerald-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-emerald-100/60 sm:flex-row sm:px-6">
          <p>
            © {year} {site.name}. Written with sincerity for every searching heart.
          </p>
          <p>
            Not medical advice ·{" "}
            <Link href="/disclaimer" className="hover:text-gold-300">
              Read our disclaimer
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-800 text-cream-100 transition-colors hover:bg-gold-400 hover:text-emerald-900"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        {children}
      </svg>
    </a>
  );
}
