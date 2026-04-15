"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
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

type PhotoFilter = "all" | "featured" | "portrait" | "landscape";

const filterOptions: Array<{ value: PhotoFilter; label: string }> = [
  { value: "all", label: "All frames" },
  { value: "featured", label: "Top picks" },
  { value: "portrait", label: "Portraits" },
  { value: "landscape", label: "Landscapes" },
];

function matchesFilter(photo: PhotoEntry, filter: PhotoFilter) {
  if (filter === "featured") {
    return photo.featured;
  }

  if (filter === "portrait") {
    return photo.orientation === "portrait";
  }

  if (filter === "landscape") {
    return photo.orientation !== "portrait";
  }

  return true;
}

export function PhotoGrid({ photos, compact = false, collection = false, showGalleryCta = true }: PhotoGridProps) {
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<PhotoFilter>("all");
  const canFilter = collection && photos.length > 12;
  const visiblePhotos = canFilter ? photos.filter((photo) => matchesFilter(photo, activeFilter)) : photos;
  const activeIndex = activePhotoId
    ? visiblePhotos.findIndex((photo) => photo.id === activePhotoId)
    : -1;
  const activePhoto = activeIndex === -1 ? null : visiblePhotos[activeIndex];
  const photoSizes = collection
    ? "(max-width: 720px) 100vw, (max-width: 980px) 50vw, 25vw"
    : compact
      ? "(max-width: 720px) 100vw, (max-width: 980px) 50vw, 33vw"
      : "(max-width: 980px) 100vw, 50vw";

  useEffect(() => {
    if (activePhoto === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActivePhotoId(null);
      }

      if (event.key === "ArrowRight" && visiblePhotos.length > 0) {
        const nextIndex = (activeIndex + 1) % visiblePhotos.length;
        setActivePhotoId(visiblePhotos[nextIndex]?.id ?? null);
      }

      if (event.key === "ArrowLeft" && visiblePhotos.length > 0) {
        const nextIndex = (activeIndex - 1 + visiblePhotos.length) % visiblePhotos.length;
        setActivePhotoId(visiblePhotos[nextIndex]?.id ?? null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, activePhoto, visiblePhotos]);

  return (
    <>
      {canFilter ? (
        <div className="filter-bar" aria-label="Gallery filters">
          <span className="filter-bar__summary">
            {new Intl.NumberFormat("en-US").format(visiblePhotos.length)} of{" "}
            {new Intl.NumberFormat("en-US").format(photos.length)} frames
          </span>
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`filter-chip${activeFilter === option.value ? " filter-chip--active" : ""}`}
              onClick={() => {
                if (
                  activePhotoId &&
                  !photos.some((photo) => photo.id === activePhotoId && matchesFilter(photo, option.value))
                ) {
                  setActivePhotoId(null);
                }

                setActiveFilter(option.value);
              }}
              aria-pressed={activeFilter === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}

      <div
        className={`photo-grid${compact ? " photo-grid--compact" : ""}${collection ? " photo-grid--collection" : ""}`}
      >
        {visiblePhotos.map((photo, index) => (
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
                onClick={() => setActivePhotoId(photo.id)}
                aria-label={`Open ${photo.title}`}
              >
                <div className={`photo-frame photo-frame--${photo.orientation ?? "landscape"}`}>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={photo.width}
                    height={photo.height}
                    sizes={photoSizes}
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
                </div>
                <p className="photo-detail">{photo.filename}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}

        {!compact && showGalleryCta ? (
          <ScrollReveal delay={220} as="div" className="gallery-cta">
            <p>Need the full archive?</p>
            <a href="/gallery">Browse the complete gallery</a>
          </ScrollReveal>
        ) : null}
      </div>

      <Dialog open={activePhoto !== null} onOpenChange={(open) => !open && setActivePhotoId(null)}>
        {activePhoto ? (
          <DialogContent className="lightbox__panel sm:max-w-[1100px]" showCloseButton={false}>
            <DialogHeader className="sr-only">
              <DialogTitle>{activePhoto.title}</DialogTitle>
              <DialogDescription>{activePhoto.alt}</DialogDescription>
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
                  onClick={() => setActivePhotoId(null)}
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
                    <p className="photo-detail">{activePhoto.event}</p>
                  </div>
                  <div className="lightbox__actions">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const nextIndex = (activeIndex - 1 + visiblePhotos.length) % visiblePhotos.length;
                        setActivePhotoId(visiblePhotos[nextIndex]?.id ?? null);
                      }}
                    >
                      <ChevronLeftIcon data-icon="inline-start" />
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const nextIndex = (activeIndex + 1) % visiblePhotos.length;
                        setActivePhotoId(visiblePhotos[nextIndex]?.id ?? null);
                      }}
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
