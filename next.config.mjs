import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Build 301 redirects from old Blogger URLs -> new /blog/<slug> paths. */
function bloggerRedirects() {
  try {
    const map = JSON.parse(
      readFileSync(join(__dirname, "content", "redirects.json"), "utf8")
    );
    return Object.entries(map).map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  } catch {
    return [];
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Covers come from varied sources (Blogger CDN, YouTube thumbnails, and future
    // automation payloads), so allow any HTTPS image host to avoid render crashes.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async redirects() {
    return [
      ...bloggerRedirects(),
      // Search now lives on the Articles page (query string is forwarded automatically)
      { source: "/search", destination: "/blog", permanent: true },
      // Old Blogger system paths
      { source: "/feeds/:path*", destination: "/rss.xml", permanent: false },
      { source: "/p/about.html", destination: "/about", permanent: true },
      {
        source: "/p/privacy-policy.html",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/p/terms-and-conditions.html",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/p/disclaimer.html",
        destination: "/disclaimer",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
