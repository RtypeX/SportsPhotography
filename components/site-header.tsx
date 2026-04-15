"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  defaultCollectionSlug,
  getCollectionDefinition,
  siteConfig,
} from "@/lib/site-data";

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const activeCollectionSlug = pathname.startsWith("/collections/")
    ? pathname.split("/")[2] ?? defaultCollectionSlug
    : defaultCollectionSlug;
  const activeCollection = getCollectionDefinition(activeCollectionSlug);
  const primaryNavItems = isHome
    ? [
        { label: "Gallery", href: "/gallery", active: false },
        { label: "Highlights", href: "/#featured", active: false },
        { label: "Contact", href: "/#contact", active: false },
      ]
    : [
        { label: "Home", href: "/", active: false },
        { label: "Gallery", href: "/gallery", active: pathname === "/gallery" },
        {
          label: "Book",
          href: `mailto:${siteConfig.emailAddress}?subject=Sports photography coverage inquiry`,
          active: false,
        },
      ];

  return (
    <header className="site-header">
      <Link href="/" className="brand-mark" aria-label={`${siteConfig.siteName} home`}>
        <span className="brand-mark__eyebrow">Sports Photography</span>
        <span className="brand-mark__name">{activeCollection.businessName}</span>
        <span className="brand-mark__detail">{activeCollection.teamName}</span>
      </Link>

      <nav className="site-nav" aria-label="Primary navigation">
        {primaryNavItems.map((item) =>
          item.href.startsWith("mailto:") ? (
            <a
              key={item.label}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={item.active ? "site-nav__link--active" : undefined}
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={item.active ? "site-nav__link--active" : undefined}
            >
              {item.label}
            </Link>
          )
        )}
      </nav>
    </header>
  );
}
