/** Central site configuration — single source of truth for branding, SEO, socials. */

export const site = {
  name: "Sabr and Sukoon",
  shortName: "Sabr & Sukoon",
  tagline: "Where Islamic wisdom meets inner peace",
  description:
    "Islamic wellness blog for Muslim women. Quran, Hadith & psychology for inner peace, anxiety relief & reconnecting with Allah.",
  // Public URL (overridable via env for previews)
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.sabrandsukoon.online").replace(
    /\/$/,
    ""
  ),
  locale: "en_US",
  language: "en",
  founded: "2026",
  logo: "/logo.svg",
  ogImage: "/og-default.png",
  email: "naziafirdous113@gmail.com",
  socials: {
    youtube: "https://www.youtube.com/@sabarandsukoon2511",
    instagram: "https://www.instagram.com/sabrandsukoon82",
  },
  author: {
    name: "Nazia Firdous",
    slug: "nazia-firdous",
    role: "Founder & Writer",
    bio: "Educator with over 20 years of experience, writing faith-based reflections that bridge Quranic wisdom and modern psychology for Muslim women seeking inner peace.",
    email: "naziafirdous113@gmail.com",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "Articles", href: "/blog" },
    { label: "Topics", href: "/topics" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  // Curated featured topics (label slugs from migration) shown in nav/home
  featuredTopics: [
    { name: "Islamic Psychology", slug: "islamic-psychology" },
    { name: "Islamic Wellness", slug: "islamic-wellness" },
    { name: "Tawakkul", slug: "tawakkul" },
    { name: "Sabr", slug: "sabr" },
    { name: "Mental Health", slug: "mental-health" },
    { name: "Heartbreak", slug: "heartbreak" },
  ],
} as const;

export type Site = typeof site;
