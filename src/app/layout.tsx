import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

// Instrument Serif, self-hosted (SIL Open Font License — see app/fonts/OFL.txt).
// Used for headings only; body copy, prices and controls use the system sans.
const displaySerif = localFont({
  src: [
    { path: "./fonts/InstrumentSerif-Regular.latin.woff2", weight: "400", style: "normal" },
    { path: "./fonts/InstrumentSerif-Italic.latin.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-display",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

export const metadata: Metadata = {
  title: {
    template: "%s | AniVibe",
    default: "AniVibe — anime merchandise, chosen with care",
  },
  description:
    "Anime miniatures, posters, stickers and keychains for fans in India. Catalogue preview with sample products.",
  // Sample data only: keep the preview out of search engines until real stock is listed.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f5f1e9",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-IN" className={displaySerif.variable}>
      <body className="flex min-h-dvh flex-col bg-ivory font-sans text-ink antialiased">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
