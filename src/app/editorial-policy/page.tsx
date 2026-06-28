import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description: `How ${site.name} researches, writes, reviews and corrects its content.`,
  alternates: { canonical: "/editorial-policy" },
};

export default function EditorialPolicyPage() {
  return (
    <PageShell
      title="Editorial Policy"
      intro="How we research, write, and review what we publish — and the integrity we hold ourselves to."
      updated="June 16, 2026"
    >
      <h2>Our mission</h2>
      <p>
        {site.name} publishes faith-based reflections that connect Quranic guidance and
        authentic Hadith with modern psychological understanding, written primarily for
        Muslim women seeking inner peace. Our goal is sincerity and benefit, never
        sensationalism.
      </p>

      <h2>Who writes our content</h2>
      <p>
        Articles are written and overseen by our founder,{" "}
        <Link href={`/author/${site.author.slug}`}>Nazia Firdous</Link>, an educator with
        over 20 years of experience. Every article is published under a named author and
        reviewed before going live.
      </p>

      <h2>Sourcing &amp; accuracy</h2>
      <ul>
        <li>
          Quranic verses and Hadith are quoted with their references (surah and ayah, or
          collection and number) wherever possible.
        </li>
        <li>
          We aim to reflect mainstream, authentic Islamic understanding and avoid
          presenting contested rulings as settled.
        </li>
        <li>
          Psychological concepts are described in general, educational terms and are not
          a substitute for professional diagnosis or treatment.
        </li>
      </ul>

      <h2>Use of AI assistance</h2>
      <p>
        We may use AI tools to assist with drafting, research and editing. No article is
        published automatically. Every piece &mdash; including anything drafted with AI
        assistance &mdash; is reviewed and approved by a human editor before publication,
        and is held to the same standards of accuracy, sincerity and benefit.
      </p>

      <h2>Corrections</h2>
      <p>
        If you spot an error &mdash; in a reference, a translation, or a fact &mdash;
        please tell us at <a href={`mailto:${site.email}`}>{site.email}</a>. We review
        every report and update articles where needed.
      </p>

      <h2>Advertising &amp; independence</h2>
      <p>
        This site may display advertising to support its running costs. Advertising never
        influences the content or opinions in our articles. See our{" "}
        <Link href="/privacy-policy">Privacy Policy</Link> for how advertising partners
        handle data.
      </p>

      <h2>Not professional advice</h2>
      <p>
        Our content is for general benefit and reflection only. It is not medical,
        psychological, or religious-ruling (fatwa) advice. Please see our{" "}
        <Link href="/disclaimer">Disclaimer</Link>.
      </p>
    </PageShell>
  );
}
