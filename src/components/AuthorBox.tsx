import Link from "next/link";
import { site } from "@/lib/site";

export default function AuthorBox() {
  const a = site.author;
  return (
    <aside className="my-10 flex flex-col gap-4 rounded-[var(--radius-card)] border border-cream-200 border-l-4 border-l-gold-400 bg-cream-100/60 p-6 shadow-soft sm:flex-row sm:items-center">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-700 font-serif text-2xl text-cream-50">
        {a.name
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
          Written by
        </p>
        <Link
          href={`/author/${a.slug}`}
          className="font-serif text-lg font-semibold text-emerald-900 hover:text-emerald-700"
        >
          {a.name}
        </Link>
        <p className="mt-1 text-sm leading-relaxed text-ink-500">{a.bio}</p>
      </div>
    </aside>
  );
}
