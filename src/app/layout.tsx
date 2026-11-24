import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope, Mukta } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DemoBanner } from "@/components/DemoBanner";
import { getLang } from "@/lib/i18n-server";
import { getSessionUserId } from "@/lib/session";

const body = Manrope({ subsets: ["latin"], variable: "--font-body" });
const heading = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-heading" });
const deva = Mukta({ subsets: ["devanagari"], weight: ["400", "600", "800"], variable: "--font-deva" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "BloodLink — Find blood, become a donor", template: "%s — BloodLink" },
  description: "Find blood banks with live stock and compatible donors near you, register as a blood donor, and discover upcoming blood donation camps.",
  openGraph: { siteName: "BloodLink", type: "website" },
};

export const viewport: Viewport = { themeColor: "#c41a33", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [lang, userId] = await Promise.all([getLang(), getSessionUserId()]);
  return (
    <html lang={lang} className={`${body.variable} ${heading.variable} ${deva.variable}`}>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <Providers lang={lang}>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
            Skip to content
          </a>
          <DemoBanner />
          <Header signedIn={!!userId} />
          <main id="main" className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
