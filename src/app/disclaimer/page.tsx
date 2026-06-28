import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: `Important disclaimer for ${site.name} — our content is faith-based reflection, not medical, psychological, or religious-ruling advice.`,
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <PageShell title="Disclaimer" updated="June 16, 2026">
      <p>
        The information on {site.name} is provided for general benefit, education and
        spiritual reflection only. Please read this disclaimer carefully.
      </p>

      <h2>Not medical or psychological advice</h2>
      <p>
        Our articles discuss emotional and mental wellbeing from a faith-based
        perspective. They are <strong>not</strong> a substitute for professional medical
        or psychological diagnosis, advice, or treatment. If you are experiencing anxiety,
        depression, or any health concern, please consult a qualified healthcare
        professional. <strong>If you are in crisis or may harm yourself, contact your
        local emergency services or a crisis helpline immediately.</strong>
      </p>

      <h2>Not a religious ruling (fatwa)</h2>
      <p>
        While we quote the Quran and authentic Hadith with sincerity, our reflections are
        the personal understanding of the author and are not formal religious rulings. For
        specific rulings (fatwa), please consult a qualified scholar.
      </p>

      <h2>Accuracy</h2>
      <p>
        We make every reasonable effort to ensure that references and information are
        accurate at the time of publishing. However, we make no warranty as to
        completeness or accuracy, and we are not liable for any errors or omissions, or
        for any outcome resulting from the use of this information.
      </p>

      <h2>External links &amp; advertising</h2>
      <p>
        This Site may contain links to external websites and may display third-party
        advertising. We are not responsible for the content or practices of third-party
        sites or advertisers. See our <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>

      <h2>Your responsibility</h2>
      <p>
        Any action you take based on the content of this Site is strictly at your own
        discretion and risk. By using this Site, you agree to this Disclaimer and our{" "}
        <Link href="/terms">Terms &amp; Conditions</Link>.
      </p>

      <p>
        Questions? Email <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </PageShell>
  );
}
