import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Sabr and Sukoon and its founder Nazia Firdous — an Islamic wellness space where Quranic guidance meets modern psychology.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <PageShell title="About Sabr and Sukoon">
      <h2>Assalamualaikum, I&rsquo;m Nazia Firdous</h2>
      <p>
        I&rsquo;m an educator with over 20 years of experience &mdash; and like many of
        you, I know what it feels like to carry quiet struggles that the world never
        sees.
      </p>
      <p>
        Sabr and Sukoon was born from a simple but deep desire: to create something
        meaningful for every Muslim heart that is searching for peace, healing, and a
        reason to hold on. This blog is for those who are anxious, overwhelmed,
        heartbroken &mdash; and still trying to find their way back to Allah.
      </p>

      <h2>Why This Blog?</h2>
      <p>
        In a world full of noise, I wanted to build a quiet space &mdash; where Islamic
        wisdom meets modern psychology, where Quranic guidance meets real human
        struggles. Every article here is written with one intention: that whoever reads
        it feels a little less alone, and a little more connected to their Creator.
      </p>

      <h2>What You Will Find Here</h2>
      <ul>
        <li>Faith-based healing rooted in Quran and authentic Hadith</li>
        <li>Islamic psychology for anxiety, overthinking and inner peace</li>
        <li>Practical Sunnah habits for everyday wellbeing</li>
        <li>Honest reflections for Muslim women navigating life&rsquo;s trials</li>
      </ul>

      <h2>A Note From Me</h2>
      <p>
        I am not a scholar or a therapist &mdash; I am a sister on the same path, learning
        and healing alongside you. Everything shared here is written with sincerity, care,
        and a du&rsquo;a that it reaches the heart that needs it most.
      </p>
      <p>
        Jazakallah Khair for being here. May Allah grant us all Sabr in our struggles and
        Sukoon in our hearts. Ameen. 🤍
      </p>
      <p>
        <strong>&mdash; Nazia Firdous</strong>
        <br />
        Founder, Sabr and Sukoon
      </p>

      <h2>Connect With Me</h2>
      <p>
        🎥{" "}
        <a href={site.socials.youtube} target="_blank" rel="noopener noreferrer">
          YouTube &mdash; SabrandSukoon
        </a>
        <br />
        📸{" "}
        <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer">
          Instagram &mdash; @sabrandsukoon82
        </a>
        <br />
        📧 <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>
      <p>
        Read more about how we work in our{" "}
        <Link href="/editorial-policy">Editorial Policy</Link>, or{" "}
        <Link href="/contact">get in touch</Link>.
      </p>
    </PageShell>
  );
}
