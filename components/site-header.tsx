"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon, FolderOpenIcon, SparklesIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { collectionDefinitions, defaultCollectionSlug, getCollectionDefinition } from "@/lib/site-data";

export function SiteHeader() {
  const primaryCollection = getCollectionDefinition(defaultCollectionSlug);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [supportsHover, setSupportsHover] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const activeCollectionSlug = pathname.startsWith("/collections/")
    ? pathname.split("/")[2] ?? defaultCollectionSlug
    : defaultCollectionSlug;
  const activeCollection = getCollectionDefinition(activeCollectionSlug);
  const highlightsHref = isHome ? "#featured" : "/#featured";

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const handleHoverCapability = () => setSupportsHover(mediaQuery.matches);

    handleHoverCapability();
    mediaQuery.addEventListener("change", handleHoverCapability);

    return () => {
      mediaQuery.removeEventListener("change", handleHoverCapability);
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openGalleryMenu = () => {
    clearCloseTimeout();
    setGalleryOpen(true);
  };

  const closeGalleryMenu = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = window.setTimeout(() => {
      setGalleryOpen(false);
      closeTimeoutRef.current = null;
    }, 120);
  };

  return (
    <header className="site-header">
      <Link href="/" className="brand-mark" aria-label={`${activeCollection.collectionName} home`}>
        <span className="brand-mark__eyebrow">{activeCollection.eventDate}</span>
        <span className="brand-mark__name">{activeCollection.collectionName}</span>
      </Link>

      <nav className="site-nav" aria-label="Primary navigation">
        <Link href={highlightsHref}>Highlights</Link>
        <div
          className="site-nav__dropdown-shell"
          onPointerEnter={supportsHover ? openGalleryMenu : undefined}
          onPointerLeave={supportsHover ? closeGalleryMenu : undefined}
        >
          <DropdownMenu
            modal={!supportsHover}
            open={galleryOpen}
            onOpenChange={(open) => {
              clearCloseTimeout();
              setGalleryOpen(open);
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="site-nav__dropdown-trigger">
                <FolderOpenIcon data-icon="inline-start" />
                Gallery
                <ChevronDownIcon data-icon="inline-end" className="site-nav__dropdown-chevron" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={supportsHover ? "end" : "center"}
              sideOffset={supportsHover ? 8 : 12}
              className="site-nav__panel"
              onPointerEnter={supportsHover ? openGalleryMenu : undefined}
              onPointerLeave={supportsHover ? closeGalleryMenu : undefined}
            >
              <DropdownMenuLabel>Collections</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/gallery">
                <SparklesIcon />
                    {primaryCollection.teamName}
                  </Link>
                </DropdownMenuItem>
                {collectionDefinitions
                  .filter((collection) => collection.slug !== primaryCollection.slug)
                  .map((collection) => (
                    <DropdownMenuItem key={collection.slug} asChild>
                      <Link href={`/collections/${collection.slug}`}>
                        <FolderOpenIcon />
                        {collection.teamName}
                      </Link>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}
