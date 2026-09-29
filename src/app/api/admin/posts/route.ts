import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { saveEditorPost } from "@/lib/editor-posts";
import { postSchema, refreshSite } from "@/lib/post-api";

export const runtime = "nodejs";

/** POST /api/admin/posts — create a post. */
export async function POST(req: NextRequest) {
  if (!(await getSession()))
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message || "Invalid post" },
      { status: 422 }
    );
  }

  try {
    const { slug } = await saveEditorPost(parsed.data);
    refreshSite(slug);
    return NextResponse.json({ ok: true, slug }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message || "Could not save the post." },
      { status: 500 }
    );
  }
}
