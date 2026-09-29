import "server-only";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getAllPostMeta } from "./posts";
import { slugifyLabel, cleanLabel } from "./slug";

export type Topic = { slug: string; name: string; count: number };

const FILE = join(process.cwd(), "content", "categories.json");

/** All topics (labels), recomputed from posts so it stays accurate as posts change. */
export async function getAllTopics(): Promise<Topic[]> {
  const counts = new Map<string, Topic>();
  for (const p of await getAllPostMeta()) {
    for (const label of p.categories) {
      const slug = slugifyLabel(label);
      if (!slug) continue; // skip labels that produce an empty slug (e.g. non-latin)
      const cur = counts.get(slug);
      if (cur) cur.count++;
      else counts.set(slug, { slug, name: cleanLabel(label), count: 1 });
    }
  }
  return [...counts.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  );
}

export async function getTopic(slug: string): Promise<Topic | null> {
  return (await getAllTopics()).find((t) => t.slug === slug) || null;
}

/** Topics with at least `min` posts — used to keep tag pages meaningful. */
export async function getSubstantialTopics(min = 2): Promise<Topic[]> {
  return (await getAllTopics()).filter((t) => t.count >= min);
}

/** Seed file (optional) — kept for reference / fast lookups. */
export function getSeededTopics(): Topic[] {
  if (!existsSync(FILE)) return [];
  try {
    return JSON.parse(readFileSync(FILE, "utf8"));
  } catch {
    return [];
  }
}
