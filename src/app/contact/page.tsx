import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name}. We'd love to hear from you.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <PageShell
      title="Contact Us"
      intro="Whether you have a reflection to share, a question, or simply a salaam — we'd love to hear from you."
    >
      <p>
        The best way to reach Sabr and Sukoon is by email. We read every message and try
        to reply as soon as we can, insha&rsquo;Allah.
      </p>

      <h2>Email</h2>
      <p>
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>

      <h2>Social</h2>
      <ul>
        <li>
          YouTube:{" "}
          <a href={site.socials.youtube} target="_blank" rel="noopener noreferrer">
            SabrandSukoon
          </a>
        </li>
        <li>
          Instagram:{" "}
          <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer">
            @sabrandsukoon82
          </a>
        </li>
      </ul>

      <h2>For collaborations &amp; feedback</h2>
      <p>
        If you&rsquo;d like to suggest a topic, share how an article helped you, or
        discuss a collaboration, please mention it in your email subject line so we can
        route it correctly.
      </p>

      <p className="text-sm text-ink-400">
        Please note: Sabr and Sukoon offers faith-based reflection, not medical or
        psychological treatment. If you are in crisis, please contact a qualified
        professional or your local emergency services.
      </p>
    </PageShell>
  );
}
