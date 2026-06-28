import { NextRequest, NextResponse } from "next/server";
import { getDraft, saveDraft, deleteDraft } from "@/lib/drafts";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

async function guard() {
  const session = await getSession();
  return !!session;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await guard()))
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const draft = getDraft(id);
  if (!draft) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const updated = {
    ...draft,
    ...body,
    id: draft.id,
    status: "draft" as const,
  };
  saveDraft(updated);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await guard()))
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  deleteDraft(id);
  return NextResponse.json({ ok: true });
}
