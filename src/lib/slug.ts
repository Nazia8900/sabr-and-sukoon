/** Client-safe slug helper (no server-only deps) — used by both server and client. */
export function slugifyLabel(label: string): string {
  return cleanLabel(label)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Normalize a category label for display (collapse newlines/tabs/zero-width chars). */
export function cleanLabel(label: string): string {
  return label
    .replace(/[​-‍﻿]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
