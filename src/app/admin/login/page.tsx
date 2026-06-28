"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";

export default function AdminLogin() {
  return (
    <Suspense fallback={<div className="py-28 text-center text-ink-400">Loading…</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-[var(--radius-card)] border border-cream-200 bg-white p-8 shadow-sm"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo className="h-12 w-12" />
          <h1 className="mt-3 font-serif text-2xl font-semibold text-emerald-900">
            Admin sign in
          </h1>
          <p className="mt-1 text-sm text-ink-400">Sabr and Sukoon editorial</p>
        </div>

        {error && (
          <p
            role="alert"
            aria-live="assertive"
            className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <label htmlFor="admin-username" className="block text-sm font-medium text-ink-700">
          Username
        </label>
        <input
          id="admin-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          className="mt-1 w-full rounded-lg border border-cream-200 px-3 py-2 text-base outline-none focus:border-emerald-400"
        />

        <label
          htmlFor="admin-password"
          className="mt-4 block text-sm font-medium text-ink-700"
        >
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-cream-200 px-3 py-2 text-base outline-none focus:border-emerald-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
