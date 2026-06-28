import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `The terms governing your use of ${site.name}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <PageShell title="Terms & Conditions" updated="June 16, 2026">
      <p>
        Welcome to {site.name}. By accessing or using this website (the
        &ldquo;Site&rdquo;), you agree to be bound by these Terms &amp; Conditions. If you
        do not agree, please do not use the Site.
      </p>

      <h2>Use of content</h2>
      <p>
        All articles, images and materials on the Site are provided for personal,
        non-commercial reading and reflection. You may share links to our articles. You
        may not republish, sell, or substantially reproduce our content without written
        permission.
      </p>

      <h2>Intellectual property</h2>
      <p>
        Unless otherwise stated, the content on this Site is the property of {site.name}
        and its author and is protected by applicable copyright laws. Quranic verses and
        Hadith are part of the Islamic tradition and are quoted with references.
      </p>

      <h2>No professional advice</h2>
      <p>
        The Site offers faith-based reflection and general educational content. It is not
        medical, psychological, legal, or religious-ruling (fatwa) advice. See our{" "}
        <Link href="/disclaimer">Disclaimer</Link> for details.
      </p>

      <h2>External links</h2>
      <p>
        The Site may contain links to third-party websites. We are not responsible for
        the content, policies or practices of those sites.
      </p>

      <h2>Advertising</h2>
      <p>
        The Site may display third-party advertising. Your interactions with advertisers
        are solely between you and the advertiser, and are governed by their terms and
        our <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        The Site and its content are provided &ldquo;as is&rdquo; without warranties of
        any kind. To the fullest extent permitted by law, {site.name} shall not be liable
        for any loss or damage arising from your use of, or reliance on, the Site.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these Terms from time to time. Continued use of the Site after
        changes constitutes acceptance of the revised Terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms? Email{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </PageShell>
  );
}
