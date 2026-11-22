import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listShadowedPosts, revertEditorPost } from "@/lib/editor-posts";
import { refreshSite } from "@/lib/post-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/revert — saved copies that shadow a repository article. */
export async function GET() {
  if (!(await getSession()))
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, posts: await listShadowedPosts() });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message || "Could not list posts." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/revert — body `{ slugs: string[] }` reverts those articles;
 * `{ all: true }` reverts every published saved copy. Articles that were
 * unpublished from the dashboard are never touched by `all`.
 */
export async function POST(req: NextRequest) {
  if (!(await getSession()))
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as
    | { slugs?: unknown; all?: unknown }
    | null;

  try {
    let slugs: string[];
    if (body && Array.isArray(body.slugs)) {
      slugs = body.slugs.filter((s): s is string => typeof s === "string");
    } else if (body && body.all === true) {
      slugs = (await listShadowedPosts())
        .filter((p) => p.status === "published")
        .map((p) => p.slug);
    } else {
      return NextResponse.json(
        { ok: false, error: "Send { slugs: [...] } or { all: true }." },
        { status: 422 }
      );
    }

    const reverted: string[] = [];
    for (const slug of slugs) {
      if (await revertEditorPost(slug)) {
        reverted.push(slug);
        refreshSite(slug);
      }
    }
    return NextResponse.json({ ok: true, reverted });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message || "Could not revert." },
      { status: 500 }
    );
  }
}
