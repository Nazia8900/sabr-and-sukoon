import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteMedia, listMedia, saveMedia } from "@/lib/media-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorized() {
  return Boolean(await getSession());
}

export async function GET() {
  if (!(await authorized())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json({ ok: true, assets: await listMedia() });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message || "Could not load media." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await authorized())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Choose an image." }, { status: 400 });
    }
    return NextResponse.json({ ok: true, asset: await saveMedia(file) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message || "Upload failed." },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await authorized())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body?.pathname || typeof body.pathname !== "string") {
    return NextResponse.json({ ok: false, error: "Missing media path." }, { status: 400 });
  }
  try {
    await deleteMedia(body.pathname);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message || "Delete failed." },
      { status: 400 }
    );
  }
}
