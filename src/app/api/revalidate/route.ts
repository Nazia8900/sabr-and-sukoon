import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

/**
 * POST /api/revalidate  — on-demand cache refresh.
 * Auth: Authorization: Bearer <REVALIDATE_TOKEN>  (or ?token=)
 * Body (optional): { "path": "/blog/some-slug" }  — defaults to refreshing the index.
 */
export async function POST(req: NextRequest) {
  const token = process.env.REVALIDATE_TOKEN;
  const auth = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const qToken = req.nextUrl.searchParams.get("token") || "";
  if (!token || (auth !== token && qToken !== token)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const path = body?.path || "/";
  revalidatePath(path);
  if (path === "/") {
    revalidatePath("/blog");
    revalidatePath("/sitemap.xml");
  }
  return NextResponse.json({ ok: true, revalidated: path });
}
