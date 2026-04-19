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
  useRef,
  useState,
  useTransition,
} from "react";

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
const initialCollectionBatch = 8;
const collectionBatchSize = 8;

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
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const canFilter = collection && photos.length > 12;
  const deferredFilter = useDeferredValue(activeFilter);
  const filteredPhotos = canFilter ? photos.filter((photo) => matchesFilter(photo, deferredFilter)) : photos;
  const [visibleCount, setVisibleCount] = useState(() =>
    collection ? Math.min(initialCollectionBatch, photos.length) : photos.length,
  );
  const visiblePhotos = collection ? filteredPhotos.slice(0, visibleCount) : filteredPhotos;
  const hasMorePhotos = visiblePhotos.length < filteredPhotos.length;
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
  const loadMorePhotos = useCallback(() => {
    setVisibleCount((currentCount) => Math.min(currentCount + collectionBatchSize, filteredPhotos.length));
  }, [filteredPhotos.length]);

  useEffect(() => {
    if (!collection || !hasMorePhotos || !loadMoreRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMorePhotos();
        }
      },
      {
        rootMargin: "900px 0px",
      },
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [collection, hasMorePhotos, loadMorePhotos]);

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

  return (
    <>
      {canFilter ? (
        <div className="filter-bar" aria-label="Gallery filters">
          <span className="filter-bar__summary">
            {new Intl.NumberFormat("en-US").format(visiblePhotos.length)} loaded of{" "}
            {new Intl.NumberFormat("en-US").format(filteredPhotos.length)} frames
          </span>
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

                  const nextFilteredPhotos = canFilter
                    ? photos.filter((photo) => matchesFilter(photo, option.value))
                    : photos;

                  setVisibleCount(
                    collection
                      ? Math.min(initialCollectionBatch, nextFilteredPhotos.length)
                      : nextFilteredPhotos.length,
                  );
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

        {!compact && showGalleryCta ? (
          <ScrollReveal delay={220} as="div" className="gallery-cta">
            <p>Need the full archive?</p>
            <Link href="/gallery">Browse the complete gallery</Link>
          </ScrollReveal>
        ) : null}
      </div>

      {collection && hasMorePhotos ? (
        <div className="photo-grid__more">
          <div ref={loadMoreRef} className="photo-grid__sentinel" aria-hidden="true" />
          <button
            type="button"
            className="photo-grid__more-button"
            onClick={loadMorePhotos}
          >
            Load more frames
          </button>
        </div>
      ) : null}

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
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  );
}
