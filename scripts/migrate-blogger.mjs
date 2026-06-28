/**
 * Migrate Blogger Atom/JSON feed -> clean content files for the custom site.
 *
 * Input : ../_discovery/feed_posts.json  (Blogger JSON feed, full content)
 * Output: content/posts/<slug>.json      (one file per post)
 *         content/redirects.json          (old Blogger path -> new /blog/<slug>)
 *         content/categories.json         (label -> {slug,name,count})
 *
 * Run:   node scripts/migrate-blogger.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
// Prefer the in-repo copy (self-contained clone); fall back to the local scrape dir.
const FEED = existsSync(join(__dirname, "blogger-feed.json"))
  ? join(__dirname, "blogger-feed.json")
  : join(ROOT, "..", "_discovery", "feed_posts.json");
const POSTS_DIR = join(ROOT, "content", "posts");
const CONTENT_DIR = join(ROOT, "content");

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z0-9#]+;/g, " ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "");
}

// Pull the Blogger "pretty" slug from the alternate post URL, fall back to title.
function bloggerSlug(entry, title) {
  const alt = (entry.link || []).find((l) => l.rel === "alternate");
  if (alt?.href) {
    const m = alt.href.match(/\/\d{4}\/\d{2}\/([^/.]+)\.html/);
    if (m) return m[1];
  }
  return slugify(title);
}

function bloggerPath(entry) {
  const alt = (entry.link || []).find((l) => l.rel === "alternate");
  if (!alt?.href) return null;
  try {
    return new URL(alt.href).pathname; // e.g. /2026/06/why-prophet-...html
  } catch {
    return null;
  }
}

// Remove redundant boilerplate while preserving the post's bespoke styling.
// Their posts begin with a microdata breadcrumb + <article> wrapper + <meta> tags,
// then a styled .post-wrap with a duplicate series-badge and title. The page chrome
// now provides breadcrumb/category/title, so we drop those duplicates but KEEP the
// <style> block and all content classes (.section-card, .ayah-box, etc.).
function cleanContent(html, title) {
  let h = html;

  // 1. Full-document posts: keep only the <body>.
  const bodyM = h.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyM) h = bodyM[1];

  // 2. Strip document scaffolding, comments, microdata, and ALL <style> blocks.
  //    Their per-post CSS was inconsistent and some posts leaked GLOBAL rules
  //    (body{}, *{}, :root{}) into the whole site. One shared, on-brand
  //    .prose stylesheet replaces every bespoke <style> block.
  h = h
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<\/?html[^>]*>/gi, "")
    .replace(/<head\b[\s\S]*?<\/head>/gi, "")
    .replace(/<title\b[\s\S]*?<\/title>/gi, "")
    .replace(/<link\b[^>]*>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<meta\b[^>]*>/gi, "");

  // 3. Slice to the real article body if wrapped, then unwrap <article>.
  const art = h.search(/<article\b/i);
  if (art !== -1) h = h.slice(art);
  else {
    const pw = h.search(/<div class="post-wrap"/i);
    if (pw !== -1) h = h.slice(pw);
  }
  h = h.replace(/<article\b[^>]*>/gi, "").replace(/<\/article>/gi, "");

  // 4. Remove chrome the page already renders (badge, dup title, byline, author/
  //    disclaimer boxes, embedded breadcrumb dashed-boxes).
  h = h.replace(/<div class="series-badge">[\s\S]*?<\/div>/i, "");
  h = h.replace(/<h1 class="post-title-main">[\s\S]*?<\/h1>/i, "");
  h = h.replace(/<(p|div)\b[^>]*>\s*By\s+[^<]{0,90}?min read\s*<\/\1>/gi, "");
  h = h.replace(
    /<div[^>]*class="[^"]*\b(?:author-box|disclaimer-box|meta-line|dua-hero-meta)\b[^"]*"[^>]*>(?:(?!<\/div>)[\s\S])*?<\/div>/gi,
    ""
  );
  h = h.replace(
    /<div[^>]*style="[^"]*dashed[^"]*"[^>]*>(?:(?!<\/div>)[\s\S])*?<\/div>/gi,
    ""
  );

  // 5. Normalise byline name and drop a leading heading that repeats the title.
  h = h.replace(/The\s+Sukoon\s+Seeker/gi, "Nazia Firdous");
  if (title) {
    const tnorm = normText(title);
    h = h.replace(/^\s*<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i, (m, inner) =>
      normText(inner) === tnorm ||
      (tnorm.length > 20 && normText(inner).startsWith(tnorm.slice(0, 25)))
        ? ""
        : m
    );
  }

  // 6. Demote any remaining in-body <h1> to <h2> (one H1 per page = the title).
  h = h.replace(/<(\/?)h1(\b[^>]*)?>/gi, "<$1h2$2>");

  // 6b. Promote faux-heading <div>s (section titles set as divs/spans) to real
  //     headings — improves SEO, AI-overview extraction, a11y, and feeds the TOC.
  h = h.replace(
    /<div\b([^>]*class="[^"]*\b(section-title|ss-h2|card-title|sub-heading)\b[^"]*"[^>]*)>((?:(?!<\/div>)[\s\S])*?)<\/div>/gi,
    (_m, attrs, cls, inner) => {
      const tag = cls === "ss-h2" ? "h2" : "h3";
      return `<${tag}${attrs}>${inner}</${tag}>`;
    }
  );

  // 7. Strip off-brand cosmetic inline styles (color/background/font) so the
  //    token-based prose + shared stylesheet apply; keep layout declarations.
  h = stripInlineCosmetics(h);

  // 8. Convert residual inline Markdown (---, > quote, ##, links, **bold**).
  h = fixInlineMarkdown(h);

  // 9. Relativise old-domain links (next.config 301s resolve them).
  h = h.replace(/https?:\/\/(?:www\.)?sabrandsukoon\.online/gi, "");

  // 10. Optimise body images (alt backfill, lazy-load, downscale huge renders).
  h = optimizeImages(h, title);

  // 11. Tidy empty paragraphs and runaway line breaks.
  h = h
    .replace(/<p>\s*(?:<br\s*\/?>\s*|&nbsp;|\s)*<\/p>/gi, "")
    .replace(/(?:<br\s*\/?>\s*){3,}/gi, "<br><br>");

  return h.trim();
}

// Remove cosmetic declarations from inline style attributes; keep layout-only ones.
function stripInlineCosmetics(html) {
  const DROP = /^(color|background|background-color|background-image|font-family|font|text-shadow|-webkit-[a-z-]*color)\s*:/i;
  return html.replace(/\sstyle="([^"]*)"/gi, (m, css) => {
    const kept = css
      .split(";")
      .map((d) => d.trim())
      .filter((d) => d && !DROP.test(d))
      .join("; ");
    return kept ? ` style="${kept}"` : "";
  });
}

// Convert leftover Markdown artifacts that Blogger wrapped in <p> tags.
function fixInlineMarkdown(html) {
  let h = html;
  h = h.replace(/<p>\s*-{3,}\s*<\/p>/gi, "<hr/>");
  h = h.replace(/<p>\s*#{3}\s*([^<]+?)\s*<\/p>/gi, "<h3>$1</h3>");
  h = h.replace(/<p>\s*#{1,2}\s*([^<]+?)\s*<\/p>/gi, "<h2>$1</h2>");
  h = h.replace(/<p>\s*(?:&gt;|>)\s*([^<]+?)\s*<\/p>/gi, "<blockquote><p>$1</p></blockquote>");
  h = h.replace(/<\/blockquote>\s*<blockquote>/gi, "");
  // group consecutive "<p>1. text</p>" paragraphs into an ordered list
  h = h.replace(/(?:<p>\s*\d+[.)]\s*([^<]+?)\s*<\/p>\s*){2,}/gi, (block) => {
    const items = [...block.matchAll(/<p>\s*\d+[.)]\s*([^<]+?)\s*<\/p>/gi)]
      .map((m) => `<li>${m[1]}</li>`)
      .join("");
    return `<ol>${items}</ol>`;
  });
  // group consecutive "<p>- text</p>" / "<p>* text</p>" paragraphs into a bullet list
  h = h.replace(/(?:<p>\s*[-*]\s+([^<]+?)\s*<\/p>\s*){2,}/gi, (block) => {
    const items = [...block.matchAll(/<p>\s*[-*]\s+([^<]+?)\s*<\/p>/gi)]
      .map((m) => `<li>${m[1]}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  });
  h = h.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2">$1</a>');
  h = h.replace(/\[([^\]\n]{1,80})\]/g, "$1");
  h = h.replace(/\*\*([^*<>]+?)\*\*/g, "<strong>$1</strong>");
  return h;
}

// Backfill alt, lazy-load, and downscale oversized Blogger images in the body.
function optimizeImages(html, title) {
  const alt = (title || "Sabr and Sukoon").replace(/"/g, "&#39;");
  let i = 0;
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    let t = tag.replace(/\/s1600\//, "/s800/").replace(/\/(s|w)(1[0-9]{3}|[2-9]\d{3})(-[a-z-]+)?\//, "/s800/");
    if (!/\balt\s*=/.test(t)) t = t.replace(/<img/i, `<img alt="${alt}"`);
    if (!/\bloading\s*=/.test(t))
      t = t.replace(/<img/i, `<img loading="${i === 0 ? "eager" : "lazy"}" decoding="async"`);
    i++;
    return t;
  });
}

function upscale(url) {
  // upgrade YouTube thumbnails to a higher resolution
  if (/img\.youtube\.com|i\.ytimg\.com/.test(url)) {
    return url.replace(/\/(default|mqdefault)\.jpg/, "/hqdefault.jpg");
  }
  // upgrade Blogger thumbnails to a larger render
  return url.replace(/\/(s|w|h)\d+(-[a-z-]+)?\//, "/s1600/");
}

// First <img> in the content, else the feed's media thumbnail, becomes the cover.
function coverImage(html, entry) {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m) return upscale(m[1]);
  // also catch images that are only linked (Blogger sometimes wraps featured image)
  const a = html.match(/<a[^>]+href=["']([^"']+\.(?:png|jpe?g|webp))["']/i);
  if (a) return upscale(a[1]);
  const thumb = entry["media$thumbnail"]?.url;
  if (thumb) return upscale(thumb);
  return null;
}

function decodeEntities(s) {
  return s
    .replace(/&#160;|&nbsp;/g, " ")
    .replace(/&#8212;|&mdash;/g, "—")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8216;|&lsquo;/g, "‘")
    .replace(/&#8220;|&ldquo;/g, "“")
    .replace(/&#8221;|&rdquo;/g, "”")
    .replace(/&#8230;|&hellip;/g, "…")
    .replace(/&#187;|&raquo;/g, "»")
    .replace(/&#171;|&laquo;/g, "«")
    .replace(/&#8250;|&rsaquo;/g, "›")
    .replace(/&#8249;|&lsaquo;/g, "‹")
    .replace(/&#10022;|&#10023;/g, "✦")
    .replace(/&#39;|&apos;/g, "’")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}

function plainText(html) {
  return decodeEntities(
    html
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(html, title, len = 165) {
  let t = plainText(html);
  // Blogger posts begin with: "Home › Category › Short ✦ Category <Full Title> <body…>"
  // 1) cut everything up to the category-badge separator "✦"
  const f = t.indexOf("✦");
  if (f !== -1 && f < 260) t = t.slice(f + 1).trim();
  else t = t.replace(/^home\s*[›»→].*?[›»→]\s*/i, "").trim();
  // 2) drop the repeated full title that follows the category label
  if (title) {
    const ti = t.indexOf(title);
    if (ti !== -1 && ti < 200) t = t.slice(ti + title.length).trim();
  }
  // 3) strip any residual breadcrumb trail wherever it sits, e.g. "Home › A › B ›"
  t = t.replace(/home\s*[›»→](?:\s*[^›»→]{1,45}[›»→])+/gi, " ");
  // 4) strip any residual leading separators/punctuation and collapse
  t = t.replace(/^[\s—–\-:|•·›»→✦]+/, "").replace(/\s+/g, " ").trim();
  if (t.length <= len) return t;
  return t.slice(0, len).replace(/\s+\S*$/, "") + "…";
}

function cleanTitle(t) {
  return decodeEntities(t)
    .trim()
    .replace(/^[\p{Extended_Pictographic}️\s✦✨🌿🤍•·]+/u, "") // leading emoji/decoration
    .replace(/\s*[|\-–—]\s*Sabr\s*(and|&)\s*Sukoon\s*$/i, "") // drop site-name suffix
    .replace(/^["“”']+|["“”']+$/g, "")
    .trim();
}

function normText(s) {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z0-9#]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const raw = JSON.parse(readFileSync(FEED, "utf8"));
const entries = raw.feed.entry || [];

mkdirSync(POSTS_DIR, { recursive: true });

const redirects = {};
const categories = {};
const index = [];
const seen = new Set();

for (const e of entries) {
  const title = cleanTitle(e.title?.$t || "");
  if (!title) continue;
  let slug = bloggerSlug(e, title);
  while (seen.has(slug)) slug = slug + "-2";
  seen.add(slug);

  const html = cleanContent(e.content?.$t || e.summary?.$t || "", title);
  const labels = (e.category || []).map((c) => c.term).filter(Boolean);
  // Normalise the inconsistent Blogger byline ("The Sukoon Seeker") to the founder's
  // name for consistent author E-E-A-T across the site.
  const rawAuthor = (e.author && e.author[0]?.name?.$t) || "";
  const author = /sukoon\s*seeker/i.test(rawAuthor) || !rawAuthor.trim()
    ? "Nazia Firdous"
    : rawAuthor.trim();
  const published = e.published?.$t || null;
  const updated = e.updated?.$t || published;
  const oldPath = bloggerPath(e);
  const cover = coverImage(html, e);

  for (const label of labels) {
    const lslug = slugify(label);
    if (!categories[lslug])
      categories[lslug] = { slug: lslug, name: label, count: 0 };
    categories[lslug].count++;
  }

  if (oldPath) redirects[oldPath] = `/blog/${slug}`;

  const post = {
    slug,
    title,
    excerpt: excerpt(html, title),
    author,
    publishedAt: published,
    updatedAt: updated,
    categories: labels,
    cover,
    status: "published",
    source: "blogger-migration",
    oldPath,
    contentHtml: html,
  };

  writeFileSync(
    join(POSTS_DIR, `${slug}.json`),
    JSON.stringify(post, null, 2),
    "utf8"
  );

  index.push({
    slug,
    title,
    excerpt: post.excerpt,
    author,
    publishedAt: published,
    updatedAt: updated,
    categories: labels,
    cover,
  });
}

index.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

writeFileSync(
  join(CONTENT_DIR, "redirects.json"),
  JSON.stringify(redirects, null, 2),
  "utf8"
);
writeFileSync(
  join(CONTENT_DIR, "categories.json"),
  JSON.stringify(
    Object.values(categories).sort((a, b) => b.count - a.count),
    null,
    2
  ),
  "utf8"
);

console.log(`Migrated ${index.length} posts -> content/posts/`);
console.log(`Redirects: ${Object.keys(redirects).length}`);
console.log(`Categories: ${Object.keys(categories).length}`);
console.log(
  "Top categories:",
  Object.values(categories)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)
    .map((c) => `${c.name}(${c.count})`)
    .join(", ")
);
