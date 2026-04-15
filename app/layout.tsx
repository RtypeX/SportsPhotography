import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";

import { SiteMotion } from "@/components/site-motion";

import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SHOOKTOURN. DUSTINSSHOTS",
  description: "Sports photography by Dustin Lapuz featuring cinematic event galleries, full-size viewing, and clean mobile-friendly browsing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <SiteMotion />
        {children}
      </body>
    </html>
  );
}
