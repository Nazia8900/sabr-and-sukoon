"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MediaAsset = {
  url: string;
  pathname: string;
  name: string;
  size: number;
  uploadedAt: string;
};

export async function uploadMedia(file: File): Promise<MediaAsset> {
  const form = new FormData();
  form.set("file", file);
  const response = await fetch("/api/admin/media", { method: "POST", body: form });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "Upload failed.");
  return data.asset as MediaAsset;
}

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
  title?: string;
};

export default function MediaLibrary({ open, onClose, onSelect, title }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/media", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not load media.");
      setAssets(data.assets);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open, onClose]);

  async function add(files: FileList | File[]) {
    const file = Array.from(files)[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const asset = await uploadMedia(file);
      setAssets((current) => [asset, ...current]);
      onSelect(asset);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(asset: MediaAsset) {
    if (!confirm(`Delete ${asset.name}? Existing articles that use it may show a broken image.`)) {
      return;
    }
    setError("");
    const response = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pathname: asset.pathname }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      setError(data.error || "Could not delete image.");
      return;
    }
    setAssets((current) => current.filter((item) => item.pathname !== asset.pathname));
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-950/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Media library"}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-cream-200 bg-cream-50 shadow-2xl">
        <div className="flex items-center justify-between border-b border-cream-200 bg-white px-5 py-4">
          <div>
            <h2 className="font-serif text-xl font-semibold text-emerald-900">
              {title || "Media library"}
            </h2>
            <p className="mt-0.5 text-xs text-ink-400">JPG, PNG, WebP or GIF · up to 4 MB</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-xl leading-none text-ink-400 hover:bg-cream-100 hover:text-ink-900"
            aria-label="Close media library"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              void add(event.dataTransfer.files);
            }}
            className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
              dragging
                ? "border-emerald-500 bg-emerald-100"
                : "border-emerald-200 bg-emerald-50 hover:border-emerald-400"
            }`}
          >
            <span className="text-3xl" aria-hidden="true">↑</span>
            <span className="mt-2 text-sm font-semibold text-emerald-800">
              {uploading ? "Uploading image…" : "Upload an image or drop it here"}
            </span>
            <span className="mt-1 text-xs text-ink-400">The uploaded image is selected automatically.</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(event) => event.target.files && void add(event.target.files)}
          />

          {error && (
            <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="mt-6 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              Uploaded images
            </h3>
            <button type="button" onClick={() => void load()} className="text-xs text-emerald-700 hover:underline">
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="py-12 text-center text-sm text-ink-400">Loading media…</p>
          ) : assets.length === 0 ? (
            <p className="py-12 text-center text-sm text-ink-400">No uploaded images yet.</p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {assets.map((asset) => (
                <div key={asset.pathname} className="group overflow-hidden rounded-xl border border-cream-200 bg-white">
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(asset);
                      onClose();
                    }}
                    className="block w-full text-left"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.url} alt="" className="aspect-square w-full bg-cream-100 object-cover" />
                    <span className="block truncate px-2 pt-2 text-xs font-medium text-ink-700">
                      {asset.name}
                    </span>
                    <span className="block px-2 pb-2 text-[10px] text-ink-400">
                      {formatBytes(asset.size)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(asset)}
                    className="w-full border-t border-cream-100 px-2 py-1.5 text-[10px] font-medium text-red-600 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100 focus:opacity-100"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
