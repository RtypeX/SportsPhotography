"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  ExternalLinkIcon,
} from "lucide-react";
import {
  type CSSProperties,
  useCallback,
  useDeferredValue,
  useEffect,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";

import type { PhotoEntry } from "@/lib/site-content";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Button } from "@/components/ui/button";
import { reportMobileDebug } from "@/lib/mobile-debug";

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
  const [isFilterPending, startFilterTransition] = useTransition();
  const canFilter = collection && photos.length > 12;
  const deferredFilter = useDeferredValue(activeFilter);
  const filteredPhotos = canFilter ? photos.filter((photo) => matchesFilter(photo, deferredFilter)) : photos;
  const visiblePhotos = filteredPhotos;
  const filterSummary =
    canFilter && deferredFilter !== "all"
      ? `Showing ${new Intl.NumberFormat("en-US").format(visiblePhotos.length)} of ${new Intl.NumberFormat("en-US").format(photos.length)} frames`
      : `${new Intl.NumberFormat("en-US").format(visiblePhotos.length)} frames ready`;
  const activeIndex = activePhotoId
    ? filteredPhotos.findIndex((photo) => photo.id === activePhotoId)
    : -1;
  const activePhoto = activeIndex === -1 ? null : filteredPhotos[activeIndex];
  const closeLightbox = useCallback(() => {
    setActivePhotoId(null);
  }, []);
  const openPreviousPhoto = useCallback(() => {
    if (filteredPhotos.length === 0) {
      return;
    }

    const nextIndex = (activeIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setActivePhotoId(filteredPhotos[nextIndex]?.id ?? null);
  }, [activeIndex, filteredPhotos]);
  const openNextPhoto = useCallback(() => {
    if (filteredPhotos.length === 0) {
      return;
    }

    const nextIndex = (activeIndex + 1) % filteredPhotos.length;
    setActivePhotoId(filteredPhotos[nextIndex]?.id ?? null);
  }, [activeIndex, filteredPhotos]);
  const galleryCta = !compact && showGalleryCta ? (
    <ScrollReveal
      delay={220}
      as="div"
      className={`gallery-cta${collection ? " gallery-cta--collection" : ""}`}
    >
      <p>Need the full archive?</p>
      <Link href="/gallery">Browse the complete gallery</Link>
    </ScrollReveal>
  ) : null;

  useEffect(() => {
    if (activePhoto === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "ArrowRight") {
        openNextPhoto();
      }

      if (event.key === "ArrowLeft") {
        openPreviousPhoto();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, activePhoto, closeLightbox, openNextPhoto, openPreviousPhoto]);

  useEffect(() => {
    if (activePhoto === null) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [activePhoto]);

  const lightbox = (
    <AnimatePresence>
      {activePhoto ? (
        <motion.div
          className="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={closeLightbox}
        >
          <motion.div
            className="lightbox__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={activePhoto.id}
              className="lightbox__panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby={`lightbox-title-${activePhoto.id}`}
              aria-describedby={`lightbox-description-${activePhoto.id}`}
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.985 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sr-only">
                <h2 id={`lightbox-title-${activePhoto.id}`}>{activePhoto.title}</h2>
                <p id={`lightbox-description-${activePhoto.id}`}>{activePhoto.alt}</p>
              </div>

              <Button
                type="button"
                variant="ghost"
                className="lightbox__close"
                onClick={closeLightbox}
                aria-label="Close image preview"
              >
                Close
              </Button>

              <div className="lightbox__media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activePhoto.src}
                  alt={activePhoto.alt}
                  width={activePhoto.width}
                  height={activePhoto.height}
                  className="lightbox__image"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  onError={() =>
                    reportMobileDebug("lightbox-image-error", {
                      photoId: activePhoto.id,
                      collectionSlug: activePhoto.collectionSlug,
                      src: activePhoto.src,
                      title: activePhoto.title,
                    })
                  }
                />
              </div>

              <div className="lightbox__actions">
                <Button
                  type="button"
                  variant="outline"
                  onClick={openPreviousPhoto}
                >
                  <ChevronLeftIcon data-icon="inline-start" />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={openNextPhoto}
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
            </motion.div>
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <>
      {canFilter ? (
        <ScrollReveal delay={80}>
          <div className="filter-bar" aria-label="Gallery filters">
            <span className="filter-bar__summary">{filterSummary}</span>
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`filter-chip${activeFilter === option.value ? " filter-chip--active" : ""}`}
                onClick={() =>
                  startFilterTransition(() => {
                    if (
                      activePhotoId &&
                      !photos.some((photo) => photo.id === activePhotoId && matchesFilter(photo, option.value))
                    ) {
                      setActivePhotoId(null);
                    }

                    setActiveFilter(option.value);
                  })
                }
                aria-pressed={activeFilter === option.value}
                disabled={isFilterPending && activeFilter !== option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </ScrollReveal>
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
            <div
              style={
                {
                  "--card-index": index,
                  "--photo-aspect-ratio": `${photo.width} / ${photo.height}`,
                } as CSSProperties
              }
            >
              <button
                type="button"
                className="photo-button"
                onClick={() => setActivePhotoId(photo.id)}
                aria-label={`Open ${photo.title}`}
              >
                <div className={`photo-frame photo-frame--${photo.orientation ?? "landscape"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    width={photo.width}
                    height={photo.height}
                    className="photo-image"
                    loading={index < 4 ? "eager" : "lazy"}
                    fetchPriority={index < 4 ? "high" : "low"}
                    decoding="async"
                    onError={() =>
                      reportMobileDebug("gallery-image-error", {
                        photoId: photo.id,
                        collectionSlug: photo.collectionSlug,
                        src: photo.src,
                        title: photo.title,
                        index,
                      })
                    }
                  />
                  <span className="photo-overlay">Open full size</span>
                </div>
              </button>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {galleryCta}
      {typeof document !== "undefined" ? createPortal(lightbox, document.body) : null}
    </>
  );
}
