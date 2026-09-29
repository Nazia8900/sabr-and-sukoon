import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const SAFE_FILENAME = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pathname: string[] }> }
) {
  const { pathname } = await params;
  if (pathname.length !== 1 || !SAFE_FILENAME.test(pathname[0])) {
    return new NextResponse("Not found", { status: 404 });
  }

  const result = await get(`media/${pathname[0]}`, {
    access: "private",
    ifNoneMatch: request.headers.get("if-none-match") || undefined,
  });

  if (!result) return new NextResponse("Not found", { status: 404 });

  const cacheHeaders = {
    ETag: result.blob.etag,
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  if (result.statusCode === 304) {
    return new NextResponse(null, { status: 304, headers: cacheHeaders });
  }

  if (result.statusCode !== 200 || !result.stream) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      ...cacheHeaders,
      "Content-Type": result.blob.contentType || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
