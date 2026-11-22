"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/drafts", label: "Automation" },
];

export default function AdminNav() {
  const pathname = usePathname() || "";

  return (
    <nav className="flex items-center gap-1 overflow-x-auto">
      {LINKS.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-emerald-100 text-emerald-800"
                : "text-ink-500 hover:bg-cream-100 hover:text-emerald-700"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
