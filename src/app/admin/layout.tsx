import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import LogoutButton from "./LogoutButton";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") || "";
  // The login screen is shown without the dashboard chrome.
  if (pathname === "/admin/login") {
    return <div className="min-h-[80vh]">{children}</div>;
  }
  return (
    <div className="min-h-[80vh]">
      <div className="border-b border-cream-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/admin" className="font-serif text-lg font-semibold text-emerald-900">
            Editorial Dashboard
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-ink-500 hover:text-emerald-700">
              View site
            </Link>
            <LogoutButton />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
