import Link from "next/link";
import { notFound } from "next/navigation";
import { getDraft, draftToHtml } from "@/lib/drafts";
import DraftEditor from "./DraftEditor";

export const dynamic = "force-dynamic";

export default async function DraftReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const draft = getDraft(id);
  if (!draft) notFound();
  const previewHtml = draftToHtml(draft);

  return (
    <div>
      <Link href="/admin" className="text-sm text-ink-500 hover:text-emerald-700">
        ← Back to queue
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-semibold text-emerald-900">
        Review draft
      </h1>
      <p className="mt-1 text-sm text-ink-400">
        Source: {draft.source} · ID: {draft.id}
      </p>
      <DraftEditor draft={draft} previewHtml={previewHtml} />
    </div>
  );
}
