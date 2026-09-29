import "server-only";
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, extname, join } from "node:path";
import { randomUUID } from "node:crypto";

export type MediaAsset = {
  url: string;
  pathname: string;
  name: string;
  size: number;
  uploadedAt: string;
};

const LOCAL_DIR = join(process.cwd(), "public", "uploads");
const ALLOWED_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

export const MAX_MEDIA_BYTES = 4 * 1024 * 1024;

function blobMediaEnabled(): boolean {
  return Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
}

function mediaUrl(pathname: string): string {
  const relative = pathname.replace(/^media\//, "");
  return `/media/${relative.split("/").map(encodeURIComponent).join("/")}`;
}

function safeFilename(name: string, type: string): string {
  const fallbackExtension = ALLOWED_TYPES.get(type) || ".jpg";
  const originalExtension = extname(name).toLowerCase();
  const extension = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(
    originalExtension
  )
    ? originalExtension
    : fallbackExtension;
  const stem = basename(name, originalExtension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "image";
  return `${Date.now()}-${randomUUID().slice(0, 8)}-${stem}${extension}`;
}

export function validateMedia(file: File): void {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Use a JPG, PNG, WebP, or GIF image.");
  }
  if (!file.size) throw new Error("The selected image is empty.");
  if (file.size > MAX_MEDIA_BYTES) {
    throw new Error("Images must be smaller than 4 MB.");
  }
}

export async function saveMedia(file: File): Promise<MediaAsset> {
  validateMedia(file);
  const filename = safeFilename(file.name, file.type);
  if (blobMediaEnabled()) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`media/${filename}`, file, {
      access: "private",
      addRandomSuffix: false,
      contentType: file.type,
    });
    return {
      url: mediaUrl(blob.pathname),
      pathname: blob.pathname,
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Media storage is not connected. Connect a Vercel Blob store to this project."
    );
  }

  mkdirSync(LOCAL_DIR, { recursive: true });
  writeFileSync(join(LOCAL_DIR, filename), Buffer.from(await file.arrayBuffer()));
  return {
    url: `/uploads/${filename}`,
    pathname: `uploads/${filename}`,
    name: file.name,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}

export async function listMedia(): Promise<MediaAsset[]> {
  if (blobMediaEnabled()) {
    const { list } = await import("@vercel/blob");
    const assets: MediaAsset[] = [];
    let cursor: string | undefined;
    do {
      const result = await list({ prefix: "media/", limit: 1000, cursor });
      assets.push(
        ...result.blobs.map((blob) => ({
          url: mediaUrl(blob.pathname),
          pathname: blob.pathname,
          name: basename(blob.pathname),
          size: blob.size,
          uploadedAt: blob.uploadedAt.toISOString(),
        }))
      );
      cursor = result.hasMore ? result.cursor : undefined;
    } while (cursor);
    return assets.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }

  if (!readdirSafe(LOCAL_DIR).length) return [];
  return readdirSafe(LOCAL_DIR)
    .filter((name) => !name.startsWith("."))
    .map((name) => {
      const info = statSync(join(LOCAL_DIR, name));
      return {
        url: `/uploads/${name}`,
        pathname: `uploads/${name}`,
        name,
        size: info.size,
        uploadedAt: info.mtime.toISOString(),
      };
    })
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

function readdirSafe(path: string): string[] {
  try {
    return readdirSync(path);
  } catch {
    return [];
  }
}

export async function deleteMedia(pathname: string): Promise<void> {
  if (blobMediaEnabled()) {
    if (!pathname.startsWith("media/")) throw new Error("Invalid media path.");
    const { del } = await import("@vercel/blob");
    await del(pathname);
    return;
  }

  const name = basename(pathname);
  if (!name || pathname !== `uploads/${name}`) throw new Error("Invalid media path.");
  const file = join(LOCAL_DIR, name);
  try {
    // Read first so a directory or other unexpected target is never removed.
    readFileSync(file);
    unlinkSync(file);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
