"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  collectionDefinitions,
  defaultCollectionSlug,
  getCollectionDefinition,
  siteConfig,
} from "@/lib/site-data";

export function SiteHeader() {
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const isHome = pathname === "/";
  const activeCollectionSlug = pathname.startsWith("/collections/")
    ? pathname.split("/")[2] ?? defaultCollectionSlug
    : defaultCollectionSlug;
  const activeCollection = getCollectionDefinition(activeCollectionSlug);
  const defaultCollection = getCollectionDefinition(defaultCollectionSlug);
  const isGalleryRoute = pathname === "/gallery" || pathname.startsWith("/collections/");
  const primaryNavItems = isHome ? [] : [{ label: "Home", href: "/", active: false }];
  const galleryItems = [
    {
      label: "Latest Gallery",
      detail: `${defaultCollection.sport} · ${defaultCollection.eventName}`,
      href: "/gallery",
      active: pathname === "/gallery",
    },
    ...collectionDefinitions
      .filter((collection) => collection.slug !== defaultCollectionSlug)
      .map((collection) => ({
      label: collection.teamName,
      detail: `${collection.sport} · ${collection.eventName}`,
      href: `/collections/${collection.slug}`,
      active: pathname === `/collections/${collection.slug}`,
    })),
  ];

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsGalleryOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsGalleryOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className="site-header">
      <Link href="/" className="brand-mark" aria-label={`${siteConfig.siteName} home`}>
        <span className="brand-mark__eyebrow">Sports Photography</span>
        <span className="brand-mark__name">{activeCollection.businessName}</span>
        <span className="brand-mark__detail">{activeCollection.teamName}</span>
      </Link>

      <nav className="site-nav" aria-label="Primary navigation">
        <div className="site-nav__dropdown-shell">
          <div
            ref={dropdownRef}
            className="site-nav__dropdown"
            onMouseEnter={() => setIsGalleryOpen(true)}
            onMouseLeave={() => setIsGalleryOpen(false)}
          >
            <button
              type="button"
              className={`site-nav__trigger${isGalleryRoute ? " site-nav__link--active" : ""}`}
              aria-expanded={isGalleryOpen}
              aria-haspopup="menu"
              aria-controls="gallery-nav-menu"
              onClick={() => setIsGalleryOpen((open) => !open)}
            >
              Gallery
              <ChevronDownIcon className="site-nav__dropdown-chevron" />
            </button>
            <div
              id="gallery-nav-menu"
              className={`site-nav__menu${isGalleryOpen ? " site-nav__menu--open" : ""}`}
              role="menu"
              aria-label="Gallery types"
            >
              <span className="site-nav__menu-label">Gallery Types</span>
              {galleryItems.map((item) => (
                <Link
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  role="menuitem"
                  aria-current={item.active ? "page" : undefined}
                  className={item.active ? "site-nav__menu-link--active" : undefined}
                  onClick={() => setIsGalleryOpen(false)}
                >
                  <span>{item.label}</span>
                  <small>{item.detail}</small>
                </Link>
              ))}
            </div>
          </div>
        </div>
        {primaryNavItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={item.active ? "site-nav__link--active" : undefined}
            >
              {item.label}
            </Link>
          ))}
      </nav>
    </header>
  );
}
