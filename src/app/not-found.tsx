import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <p className="font-arabic text-4xl text-emerald-600">سكون</p>
      <h1 className="mt-4 font-serif text-4xl font-semibold text-emerald-900">
        Page not found
      </h1>
      <p className="mt-3 text-ink-500">
        The page you&rsquo;re looking for may have moved. Let&rsquo;s find you something
        beneficial instead.
      </p>
      <div className="mt-7 flex gap-3">
        <Link
          href="/"
          className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Home
        </Link>
        <Link
          href="/blog"
          className="rounded-full border border-emerald-300 bg-white px-6 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
        >
          Browse articles
        </Link>
      </div>
    </div>
  );
}
