"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { site } from "@/lib/site";

type NavItem = { label: string; href: string };

/**
 * Full-screen mobile nav overlay. Fixed-position (does not push content),
 * fades/slides in, locks body scroll, closes on Escape / link / backdrop.
 */
export default function MobileMenu({
  open,
  onClose,
  id,
}: {
  open: boolean;
  onClose: () => void;
  id: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Move focus into the panel for keyboard users.
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const items: NavItem[] = [...site.nav];

  return (
    <div
      id={id}
      className="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-emerald-900/40 backdrop-blur-sm motion-safe:animate-[fade-in_.2s_ease-out]"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="absolute inset-x-0 top-0 origin-top border-b border-cream-200 bg-cream-50 px-4 pb-6 pt-[calc(4rem+0.5rem)] shadow-[var(--shadow-card)] outline-none motion-safe:animate-[slide-down_.22s_ease-out]"
      >
        <nav className="flex flex-col">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="rounded-[var(--radius-sm)] px-2 py-3 text-base font-medium text-ink-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 focus-visible:bg-emerald-50 focus-visible:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/50"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
}
