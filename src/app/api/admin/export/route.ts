import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { exportStoredPosts } from "@/lib/content-store";
import { getAllFilePostMeta, getFilePostSource } from "@/lib/posts";

export const runtime = "nodejs";

/**
 * GET /api/admin/export — download every article as one JSON file.
 *
 * Covers both sources, so the download is a complete copy of the site's
 * content and never depends on any one service still being around.
 */
export async function GET() {
  if (!(await getSession()))
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const stored = await exportStoredPosts();
  const overridden = new Set(stored.map((p) => p.slug));

  const migrated = getAllFilePostMeta()
    .filter((p) => !overridden.has(p.slug))
    .map((p) => {
      const src = getFilePostSource(p.slug);
      return {
        ...p,
        format: src?.format || "html",
        body: src?.body || "",
        origin: "blogger-migration",
      };
    });

  const payload = {
    site: "Sabr and Sukoon",
    exportedAt: new Date().toISOString(),
    count: stored.length + migrated.length,
    posts: [...stored.map((p) => ({ ...p, origin: "editor" })), ...migrated],
  };

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="sabr-and-sukoon-posts-${stamp}.json"`,
    },
  });
}
