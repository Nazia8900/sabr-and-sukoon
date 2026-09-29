/**
 * POST /api/ingest  — automation ingestion endpoint (DRAFT-ONLY).
 *
 * Your auto-blogging engine (Make.com / Zapier / a script) posts article data here.
 * It is stored as a DRAFT and never published automatically. A human approves it in
 * /admin. Authenticate with:  Authorization: Bearer <INGEST_TOKEN>
 *
 * Example body:
 * {
 *   "title": "Finding Calm in Surah Ad-Duha",
 *   "contentMarkdown": "## The morning light...\n\nText...",
 *   "categories": ["Tawakkul", "Islamic Wellness"],
 *   "excerpt": "A short reflection...",
 *   "source": "make.com",
 *   "meta": { "keywords": ["duha","hope"], "model": "claude-opus" }
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveDraft, slugify, type Draft } from "@/lib/drafts";

export const runtime = "nodejs";

const schema = z
  .object({
    title: z.string().min(3).max(300),
    slug: z.string().optional(),
    excerpt: z.string().max(400).optional(),
    author: z.string().optional(),
    categories: z.array(z.string()).optional(),
    cover: z.string().url().nullable().optional(),
    contentHtml: z.string().optional(),
    contentMarkdown: z.string().optional(),
    source: z.string().optional(),
    meta: z.record(z.unknown()).optional(),
  })
  .refine((d) => d.contentHtml || d.contentMarkdown, {
    message: "Provide contentHtml or contentMarkdown",
    path: ["content"],
  });

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export async function POST(req: NextRequest) {
  const token = process.env.INGEST_TOKEN;
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Ingestion not configured (INGEST_TOKEN missing)" },
      { status: 503 }
    );
  }
  const auth = req.headers.get("authorization") || "";
  const provided = auth.replace(/^Bearer\s+/i, "");
  if (provided !== token) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const d = parsed.data;
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const draft: Draft = {
    id,
    title: d.title,
    slug: d.slug || slugify(d.title),
    excerpt: d.excerpt,
    author: d.author || "Nazia Firdous",
    categories: d.categories || [],
    cover: d.cover ?? null,
    contentHtml: d.contentHtml,
    contentMarkdown: d.contentMarkdown,
    status: "draft",
    source: d.source || "automation",
    meta: d.meta,
    createdAt: new Date().toISOString(),
  };

  try {
    await saveDraft(draft);
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Could not persist draft. On read-only/serverless hosts, point the draft store at a database (see lib/drafts.ts).",
        detail: (e as Error).message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { ok: true, id, status: "draft", review: `/admin/drafts/${id}` },
    { status: 201 }
  );
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/ingest",
    method: "POST",
    auth: "Authorization: Bearer <INGEST_TOKEN>",
    note: "Drafts are never auto-published; approve them in /admin.",
  });
}
