import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Inter } from "next/font/google";

import { THEME_BOOTSTRAP_SCRIPT } from "@/store/useAppStore";

import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-display",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Catch the Flood — Midnight Forgetting",
  description:
    "A gallery-grade home for finished creative work, built for neurodivergent creators. Your ideas. Your voice. Finished.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="blood"
      data-font="default"
      className={`${cinzel.variable} ${cormorant.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies the stored theme before first paint, so there is no flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
