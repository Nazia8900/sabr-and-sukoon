import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses and protects your information, including cookies and third-party advertising.`,
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy" updated="June 16, 2026">
      <p>
        This Privacy Policy explains how {site.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;)
        collects, uses, and safeguards information when you visit{" "}
        <strong>{site.url.replace(/^https?:\/\//, "")}</strong> (the &ldquo;Site&rdquo;).
        By using the Site, you agree to the practices described here.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Information you provide</strong> &mdash; e.g. your name and email if you
          contact us directly.
        </li>
        <li>
          <strong>Automatically collected data</strong> &mdash; standard log and analytics
          data such as your browser type, device, approximate location, pages viewed and
          referring URLs.
        </li>
        <li>
          <strong>Cookies</strong> &mdash; small files used to remember preferences and to
          measure and improve the Site.
        </li>
      </ul>

      <h2>Cookies &amp; advertising</h2>
      <p>
        We may use cookies and similar technologies for analytics and advertising. Third
        party vendors, including Google, may use cookies to serve ads based on your prior
        visits to this or other websites.
      </p>
      <ul>
        <li>
          Google&rsquo;s use of advertising cookies enables it and its partners to serve
          ads to you based on your visit to our Site and/or other sites on the Internet.
        </li>
        <li>
          You may opt out of personalised advertising by visiting{" "}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>
          . You can also opt out of third-party vendor cookies at{" "}
          <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">
            www.aboutads.info
          </a>
          .
        </li>
        <li>You can disable cookies in your browser settings at any time.</li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>To operate, maintain and improve the Site and its content.</li>
        <li>To respond to your messages and requests.</li>
        <li>To understand how the Site is used through aggregated analytics.</li>
        <li>To display relevant advertising that helps keep the Site free.</li>
      </ul>

      <h2>Third-party services</h2>
      <p>
        We may use trusted third-party services (such as analytics and advertising
        providers, and our hosting platform) that process limited data on our behalf.
        These providers have their own privacy policies governing their use of your
        information.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on your location, you may have the right to access, correct or delete
        the personal information we hold about you. To make a request, email us at{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <h2>Children&rsquo;s privacy</h2>
      <p>
        The Site is not directed to children under 13, and we do not knowingly collect
        personal information from them.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Changes will be posted on
        this page with an updated date.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Email{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>. See also our{" "}
        <Link href="/terms">Terms</Link> and <Link href="/disclaimer">Disclaimer</Link>.
      </p>
    </PageShell>
  );
}
