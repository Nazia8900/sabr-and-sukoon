import type { Metadata } from "next";
import { site } from "./site";
import type { Post } from "./posts";
import { isoDate } from "./format";

const abs = (path: string) => (path.startsWith("http") ? path : `${site.url}${path}`);

/** Default metadata applied site-wide (extended per page). */
export function baseMetadata(): Metadata {
  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.name} — ${site.tagline}`,
      template: `%s | ${site.name}`,
    },
    description: site.description,
    applicationName: site.name,
    authors: [{ name: site.author.name }],
    creator: site.author.name,
    publisher: site.name,
    keywords: [
      "Islamic wellness",
      "Muslim women",
      "Quran reflection",
      "Islamic psychology",
      "anxiety relief Islam",
      "sabr",
      "sukoon",
      "tawakkul",
      "mental health Islam",
    ],
    alternates: {
      canonical: "/",
      types: { "application/rss+xml": `${site.url}/rss.xml` },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: `${site.name} — ${site.tagline}`,
      description: site.description,
      url: site.url,
      locale: site.locale,
      images: [{ url: abs(site.ogImage), width: 1200, height: 630, alt: site.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.name} — ${site.tagline}`,
      description: site.description,
      images: [abs(site.ogImage)],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
    category: "health",
  };
}

export function postMetadata(post: Post): Metadata {
  const url = `${site.url}/blog/${post.slug}`;
  const images = post.cover
    ? [{ url: post.cover, width: 1200, height: 630, alt: post.title }]
    : [{ url: abs(site.ogImage), width: 1200, height: 630, alt: post.title }];
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    authors: [{ name: post.author }],
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt,
      publishedTime: isoDate(post.publishedAt),
      modifiedTime: isoDate(post.updatedAt),
      authors: [post.author],
      tags: post.categories,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: images.map((i) => i.url),
    },
  };
}

/* ─────────────────────────── JSON-LD builders ─────────────────────────── */

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.url}/#organization`,
    name: site.name,
    url: site.url,
    logo: abs(site.logo),
    email: site.email,
    sameAs: [site.socials.youtube, site.socials.instagram],
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: site.language,
    publisher: { "@id": `${site.url}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${site.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function personLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${site.url}/author/${site.author.slug}/#person`,
    name: site.author.name,
    url: `${site.url}/author/${site.author.slug}`,
    jobTitle: site.author.role,
    description: site.author.bio,
    email: site.author.email,
    worksFor: { "@id": `${site.url}/#organization` },
    sameAs: [site.socials.youtube, site.socials.instagram],
  };
}

export function articleLd(post: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${site.url}/blog/${post.slug}/#article`,
    isPartOf: { "@id": `${site.url}/#website` },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${site.url}/blog/${post.slug}` },
    headline: post.title,
    description: post.excerpt,
    image: post.cover ? [post.cover] : [abs(site.ogImage)],
    datePublished: isoDate(post.publishedAt),
    dateModified: isoDate(post.updatedAt),
    inLanguage: site.language,
    articleSection: post.categories.slice(0, 5),
    keywords: post.categories.join(", "),
    wordCount: post.contentHtml.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length,
    author: {
      "@type": "Person",
      name: post.author,
      url: `${site.url}/author/${site.author.slug}`,
    },
    publisher: { "@id": `${site.url}/#organization` },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}
