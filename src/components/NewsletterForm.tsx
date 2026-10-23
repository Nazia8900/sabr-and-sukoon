"use client";

import { useState } from "react";

const ACCOUNT_ID = "2505110";
const FORM_ID = "202108930327840054";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const body = new FormData();
      body.append("fields[email]", email);
      body.append("ml-submit", "1");
      body.append("anticsrf", "true");
      const res = await fetch(
        `https://assets.mailerlite.com/jsonp/${ACCOUNT_ID}/forms/${FORM_ID}/subscribe`,
        { method: "POST", body }
      );
      const data = await res.json();
      if (data.success) {
        setStatus("ok");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mx-auto mt-16 max-w-xl rounded-[var(--radius-card)] bg-emerald-50 px-6 py-10 text-center">
      <h2 className="font-serif text-2xl font-semibold text-emerald-900">
        Gentle reminders in your inbox
      </h2>
      <p className="mt-2 text-sm text-ink-500">
        Faith-rooted reflections for inner peace. No spam, unsubscribe anytime.
      </p>
      {status === "ok" ? (
        <p className="mt-5 font-medium text-emerald-700">
          JazakAllahu khayran! Please check your email to confirm your subscription.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            aria-label="Email address"
            className="flex-1 rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
      )}
      {status === "error" && (
        <p className="mt-3 text-sm text-red-600">Something went wrong. Please try again.</p>
      )}
    </section>
  );
}
