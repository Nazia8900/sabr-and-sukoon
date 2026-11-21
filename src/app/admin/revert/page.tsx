"use client";

import { useCallback, useEffect, useState } from "react";

type Item = { slug: string; title: string; status: string; updatedAt: string };

export default function RevertPage() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setMessage("");
    try {
      const res = await fetch("/api/admin/revert", { cache: "no-store" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Could not load.");
      setItems(data.posts as Item[]);
    } catch (e) {
      setMessage((e as Error).message);
      setItems([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function send(payload: { slugs?: string[]; all?: boolean }) {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/revert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Could not revert.");
      setMessage(`Reverted ${data.reverted.length} article(s) to the GitHub version.`);
      await load();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const published = (items || []).filter((i) => i.status === "published");

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-emerald-900">
        Revert to the GitHub version
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-500">
        These articles have a saved copy from this dashboard. The site shows
        that copy instead of the file in GitHub. Reverting deletes the saved
        copy, so the GitHub version shows again.
      </p>

      {message && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      )}

      {items === null ? (
        <p className="mt-6 text-sm text-ink-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-sm text-ink-500">
          Nothing to revert. Every migrated article already shows its GitHub version.
        </p>
      ) : (
        <>
          <div className="mt-6">
            <button
              type="button"
              disabled={busy || published.length === 0}
              onClick={() => {
                if (
                  window.confirm(
                    `Revert ${published.length} published article(s) to the GitHub version? Their saved edits from this dashboard will be lost.`
                  )
                )
                  send({ all: true });
              }}
              className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Revert all published ({published.length})
            </button>
          </div>

          <ul className="mt-6 divide-y divide-cream-200 rounded-xl border border-cream-200 bg-white">
            {items.map((i) => (
              <li
                key={i.slug}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-emerald-900">
                    {i.title}
                  </div>
                  <div className="text-xs text-ink-500">
                    /blog/{i.slug} · {i.status}
                    {i.status !== "published" ? " (unpublished from the dashboard)" : ""}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(`Revert "${i.title}" to the GitHub version?`))
                      send({ slugs: [i.slug] });
                  }}
                  className="shrink-0 rounded-full border border-emerald-700 px-4 py-1.5 text-sm text-emerald-800 disabled:opacity-50"
                >
                  Revert
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
