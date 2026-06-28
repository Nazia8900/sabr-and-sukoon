import type { Metadata } from "next";
import { Inter, Lora, Amiri } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { baseMetadata, organizationLd, websiteLd, personLd } from "@/lib/seo";
import { getAllTopics } from "@/lib/topics";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", display: "swap" });
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

export const metadata: Metadata = baseMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const topics = getAllTopics().slice(0, 6);
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable} ${amiri.variable}`}>
      <body className="flex min-h-screen flex-col">
        <JsonLd data={[organizationLd(), websiteLd(), personLd()]} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-emerald-700 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer topics={topics} />
      </body>
    </html>
  );
}
