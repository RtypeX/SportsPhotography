import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";

import { SiteMotion } from "@/components/site-motion";
import { siteConfig } from "@/lib/site-data";

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
  title: {
    default: `${siteConfig.shortName} | Sports Photography`,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: "Sports photography by Dustin Lapuz featuring cinematic event galleries, full-size viewing, and clean mobile-friendly browsing.",
  applicationName: siteConfig.siteName,
  openGraph: {
    title: `${siteConfig.shortName} | Sports Photography`,
    description:
      "Sports photography by Dustin Lapuz featuring cinematic event galleries, full-size viewing, and clean mobile-friendly browsing.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.shortName} | Sports Photography`,
    description:
      "Sports photography by Dustin Lapuz featuring cinematic event galleries, full-size viewing, and clean mobile-friendly browsing.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
