import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { saveEditorPost, deleteEditorPost } from "@/lib/editor-posts";
import { postSchema, refreshSite } from "@/lib/post-api";

export const runtime = "nodejs";

/** PUT /api/admin/posts/[slug] — update an existing post. */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await getSession()))
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { slug: originalSlug } = await params;
  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse({ ...body, originalSlug });
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message || "Invalid post" },
      { status: 422 }
    );
  }

  try {
    const { slug, renamedFrom } = await saveEditorPost(parsed.data);
    refreshSite(slug);
    if (renamedFrom) refreshSite(renamedFrom);
    return NextResponse.json({ ok: true, slug, renamedFrom });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message || "Could not save the post." },
      { status: 500 }
    );
  }
}

/** DELETE /api/admin/posts/[slug] — remove, or unpublish a migrated article. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await getSession()))
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  try {
    const outcome = await deleteEditorPost(slug);
    refreshSite(slug);
    return NextResponse.json({ ok: true, outcome });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message || "Could not delete the post." },
      { status: 500 }
    );
  }
}
