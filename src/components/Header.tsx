"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { site } from "@/lib/site";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuId = useId();

  return (
    <header className="sticky top-0 z-40 border-b border-cream-200/80 bg-cream-50/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5"
          aria-label={site.name}
        >
          <Logo className="h-9 w-9 shrink-0" />
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate font-serif text-lg font-semibold text-emerald-900">
              {site.name}
            </span>
            <span className="truncate text-[11px] tracking-wide text-ink-400">
              {site.tagline}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink-700 transition-colors hover:text-emerald-600"
            >
              {item.label}
            </Link>
          ))}
          <HeaderSearch open={searchOpen} setOpen={setSearchOpen} />
        </nav>

        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/50 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-controls={menuId}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-4 w-6" aria-hidden="true">
            <span
              className={`absolute left-0 block h-0.5 w-6 rounded bg-emerald-900 transition-transform duration-200 motion-reduce:transition-none ${
                open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1/2 block h-0.5 w-6 -translate-y-1/2 rounded bg-emerald-900 transition-opacity duration-200 motion-reduce:transition-none ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 block h-0.5 w-6 rounded bg-emerald-900 transition-transform duration-200 motion-reduce:transition-none ${
                open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
              }`}
            />
          </span>
        </button>
      </div>

      <MobileMenu open={open} onClose={() => setOpen(false)} id={menuId} />
    </header>
  );
}

/** Inline, keyboard-accessible search popover. Submit → /blog?q=<encoded>. */
function HeaderSearch({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // Focus the input on open; close on Escape or outside click.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, setOpen]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/blog?q=${encodeURIComponent(q)}` : "/blog");
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Search articles"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/50"
      >
        <SearchIcon />
      </button>

      {open && (
        <form
          id={panelId}
          role="search"
          onSubmit={submit}
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 flex w-72 items-center gap-2 rounded-[var(--radius-card)] border border-cream-200 bg-cream-50 p-2 shadow-[var(--shadow-card)] motion-safe:animate-[fade-in_.15s_ease-out]"
        >
          <label htmlFor={`${panelId}-input`} className="sr-only">
            Search articles
          </label>
          <input
            id={`${panelId}-input`}
            ref={inputRef}
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search articles…"
            className="min-w-0 flex-1 rounded-[var(--radius-sm)] bg-cream-100 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/50"
          />
          <button
            type="submit"
            aria-label="Submit search"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-emerald-600 text-cream-50 transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/50"
          >
            <SearchIcon />
          </button>
          <style>{`@keyframes fade-in { from { opacity: 0; transform: translateY(-4px) } to { opacity: 1; transform: translateY(0) } }`}</style>
        </form>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}
