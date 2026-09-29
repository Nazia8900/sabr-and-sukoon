import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import LogoutButton from "./LogoutButton";
import AdminNav from "@/components/admin/AdminNav";

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
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/admin"
            className="shrink-0 font-serif text-lg font-semibold text-emerald-900"
          >
            Editorial Dashboard
          </Link>
          <AdminNav />
          <div className="flex shrink-0 items-center gap-4 text-sm">
            <Link
              href="/"
              target="_blank"
              className="hidden text-ink-500 hover:text-emerald-700 sm:inline"
            >
              View site ↗
            </Link>
            <LogoutButton />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
