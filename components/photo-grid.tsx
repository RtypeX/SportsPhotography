"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { PhotoEntry } from "@/lib/site-content";
import { ScrollReveal } from "@/components/scroll-reveal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type PhotoGridProps = {
  photos: PhotoEntry[];
  compact?: boolean;
  collection?: boolean;
  showGalleryCta?: boolean;
};

export function PhotoGrid({ photos, compact = false, collection = false, showGalleryCta = true }: PhotoGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((current) => (current === null ? current : (current + 1) % photos.length));
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === null ? current : (current - 1 + photos.length) % photos.length,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, photos.length]);

  const activePhoto = activeIndex === null ? null : photos[activeIndex];

  return (
    <>
      <div
        className={`photo-grid${compact ? " photo-grid--compact" : ""}${collection ? " photo-grid--collection" : ""}`}
      >
        {photos.map((photo, index) => (
          <ScrollReveal
            key={photo.id}
            delay={Math.min(index * 45, 260)}
            as="article"
            className="photo-card"
          >
            <div style={{ "--card-index": index } as React.CSSProperties}>
              <button
                type="button"
                className="photo-button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Open ${photo.title}`}
              >
                <div className={`photo-frame photo-frame--${photo.orientation ?? "landscape"}`}>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={photo.width}
                    height={photo.height}
                    sizes={compact ? "(max-width: 900px) 100vw, 33vw" : "(max-width: 900px) 100vw, 50vw"}
                    className="photo-image"
                    quality={100}
                    unoptimized
                  />
                  <span className="photo-overlay">Open full size</span>
                </div>
              </button>
              <div className="photo-copy">
                <div>
                  <p className="photo-meta">{photo.team}</p>
                  <h3>{photo.title}</h3>
                  <p className="photo-detail">{photo.caption}</p>
                </div>
                <p className="photo-detail">{photo.filename}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}

        {!compact && showGalleryCta ? (
          <ScrollReveal delay={220} as="div" className="gallery-cta">
            <p>Need the full archive?</p>
            <Link href="/gallery">Browse the complete gallery</Link>
          </ScrollReveal>
        ) : null}
      </div>

      <Dialog open={activePhoto !== null} onOpenChange={(open) => !open && setActiveIndex(null)}>
        {activePhoto ? (
          <DialogContent className="lightbox__panel sm:max-w-[1100px]" showCloseButton={false}>
            <DialogHeader className="sr-only">
              <DialogTitle>{activePhoto.title}</DialogTitle>
              <DialogDescription>{activePhoto.caption}</DialogDescription>
            </DialogHeader>

            <AnimatePresence mode="wait">
              <motion.div
                key={activePhoto.id}
                className="lightbox__motion"
                initial={{ opacity: 0, y: 18, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.985 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  className="lightbox__close"
                  onClick={() => setActiveIndex(null)}
                  aria-label="Close image preview"
                >
                  Close
                </Button>

                <div className="lightbox__media">
                  <Image
                    src={activePhoto.src}
                    alt={activePhoto.alt}
                    width={activePhoto.width}
                    height={activePhoto.height}
                    className="lightbox__image"
                    sizes="100vw"
                    priority
                    quality={100}
                    unoptimized
                  />
                </div>

                <div className="lightbox__meta">
                  <div>
                    <p className="photo-meta">{activePhoto.team}</p>
                    <h3>{activePhoto.title}</h3>
                    <p className="photo-detail">{activePhoto.caption}</p>
                  </div>
                  <div className="lightbox__actions">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setActiveIndex((current) =>
                          current === null ? 0 : (current - 1 + photos.length) % photos.length,
                        )
                      }
                    >
                      <ChevronLeftIcon data-icon="inline-start" />
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setActiveIndex((current) => (current === null ? 0 : (current + 1) % photos.length))
                      }
                    >
                      Next
                      <ChevronRightIcon data-icon="inline-end" />
                    </Button>
                    <Button asChild variant="outline">
                      <a href={activePhoto.src} target="_blank" rel="noopener noreferrer">
                        <ExternalLinkIcon data-icon="inline-start" />
                        Open original
                      </a>
                    </Button>
                    <Button asChild>
                      <a href={activePhoto.src} download>
                        <DownloadIcon data-icon="inline-start" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  );
}
