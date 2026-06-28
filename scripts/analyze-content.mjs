/**
 * Analyze migrated post bodies to drive normalization decisions.
 * Reports: bespoke class union, inline-style color/font patterns, global-CSS posts,
 * raw-markdown posts, duplicate-<h1> posts, old-domain links, alt-less images.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "content", "posts");
const files = readdirSync(DIR).filter((f) => f.endsWith(".json"));

const classes = new Map();
const colors = new Map();
const fonts = new Map();
const globalCss = [];
const rawMarkdown = [];
const dupH1 = [];
const oldDomain = [];
let altless = 0,
  imgs = 0,
  withStyleTag = 0,
  withInlineStyle = 0;

for (const f of files) {
  const p = JSON.parse(readFileSync(join(DIR, f), "utf8"));
  const h = p.contentHtml || "";

  for (const m of h.matchAll(/class=["']([^"']+)["']/g))
    for (const c of m[1].split(/\s+/)) classes.set(c, (classes.get(c) || 0) + 1);

  for (const m of h.matchAll(/(?:color|background(?:-color)?)\s*:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/g))
    colors.set(m[1].toLowerCase(), (colors.get(m[1].toLowerCase()) || 0) + 1);

  for (const m of h.matchAll(/font-family\s*:\s*([^;"']+)/g)) {
    const fam = m[1].split(",")[0].trim().replace(/['"]/g, "");
    fonts.set(fam, (fonts.get(fam) || 0) + 1);
  }

  if (/<style[^>]*>[\s\S]*?(?:^|\s|\{|,)(?:body|html|:root|\*)\s*\{/m.test(h)) globalCss.push(f);
  if (/<p>\s*(?:---|\*\s|\d+\.\s|&gt;|>\s|#{1,3}\s)/.test(h) || /<p>\s*-{3,}\s*<\/p>/.test(h))
    rawMarkdown.push(f);

  const h1Count = (h.match(/<h1\b/gi) || []).length;
  if (h1Count >= 1) dupH1.push(`${f}(${h1Count})`);

  if (/href=["']https?:\/\/(?:www\.)?sabrandsukoon\.online/i.test(h)) oldDomain.push(f);

  for (const m of h.matchAll(/<img\b[^>]*>/gi)) {
    imgs++;
    if (!/\balt\s*=/.test(m[0])) altless++;
  }
  if (/<style[\s>]/.test(h)) withStyleTag++;
  if (/\bstyle=/.test(h)) withInlineStyle++;
}

const top = (m, n = 40) =>
  [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k} (${v})`);

console.log(`=== ${files.length} posts analyzed ===\n`);
console.log(`posts with <style> tag:     ${withStyleTag}`);
console.log(`posts with inline style=:   ${withInlineStyle}`);
console.log(`posts with GLOBAL css (*/body/html/:root): ${globalCss.length}`);
console.log(`posts with raw markdown:    ${rawMarkdown.length}`);
console.log(`posts with <h1> in body:    ${dupH1.length}`);
console.log(`posts linking old domain:   ${oldDomain.length}`);
console.log(`images: ${imgs}, alt-less: ${altless}\n`);
console.log(`--- bespoke CLASSES (union, top 40) ---\n${top(classes).join("\n")}\n`);
console.log(`--- inline COLORS (top 30) ---\n${top(colors, 30).join("\n")}\n`);
console.log(`--- inline FONTS ---\n${top(fonts, 20).join("\n")}\n`);
console.log(`--- GLOBAL-CSS posts ---\n${globalCss.join("\n")}\n`);
console.log(`--- RAW-MARKDOWN posts ---\n${rawMarkdown.join("\n")}`);
