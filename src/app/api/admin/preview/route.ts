import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { renderRecordHtml } from "@/lib/posts";

export const runtime = "nodejs";

/**
 * POST /api/admin/preview — render editor content exactly as the live site will.
 *
 * The preview runs through the same markdown parser and the same sanitizer as
 * the published page, so what the editor shows is what readers get — including
 * anything the sanitizer strips out.
 */
export async function POST(req: NextRequest) {
  if (!(await getSession()))
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const format = body?.format === "html" ? "html" : "markdown";
  const source = typeof body?.body === "string" ? body.body : "";

  try {
    return NextResponse.json({ ok: true, html: renderRecordHtml({ format, body: source }) });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not render preview" }, { status: 500 });
  }
}
