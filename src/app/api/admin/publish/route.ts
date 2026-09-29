import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { publishDraft } from "@/lib/drafts";
import { invalidatePostsCache } from "@/lib/posts";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.id)
    return NextResponse.json({ ok: false, error: "Missing draft id" }, { status: 400 });

  const { id, ...overrides } = body;
  try {
    const slug = await publishDraft(id, overrides);
    invalidatePostsCache(); // ensure the new post appears immediately
    // refresh affected routes
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ ok: true, slug });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error:
          (e as Error).message ||
          "Publish failed. On read-only/serverless hosts, the file-based store cannot write — use a DB adapter (see lib/drafts.ts).",
      },
      { status: 500 }
    );
  }
}
