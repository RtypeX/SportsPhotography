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
  collectionSlug?: string;
  totalPhotos?: number;
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

const PAGE_SIZE = 48;
const REVEAL_LIMIT = 24;

export function PhotoGrid({
  photos,
  compact = false,
  collection = false,
  showGalleryCta = true,
  collectionSlug,
  totalPhotos,
}: PhotoGridProps) {
  const [loadedPhotos, setLoadedPhotos] = useState(photos);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<PhotoFilter>("all");
  const [isFilterPending, startFilterTransition] = useTransition();
  const [isPagePending, startPageTransition] = useTransition();
  const canPaginate = collection && !!collectionSlug;
  const totalAvailable = totalPhotos ?? loadedPhotos.length;
  const canFilter = collection && totalAvailable > 12;
  const deferredFilter = useDeferredValue(activeFilter);
  const filteredPhotos = canFilter
    ? loadedPhotos.filter((photo) => matchesFilter(photo, deferredFilter))
    : loadedPhotos;
  const visiblePhotos = filteredPhotos;
  const hasMore = loadedPhotos.length < totalAvailable;
  const shouldReduceReveal = collection && loadedPhotos.length > 60;
  const loadMorePhotos = useCallback(() => {
    if (!canPaginate || !hasMore || isPagePending) {
      return;
    }

    startPageTransition(async () => {
      try {
        const response = await fetch(
          `/api/collections/${collectionSlug}/photos?offset=${loadedPhotos.length}&limit=${PAGE_SIZE}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          photos?: PhotoEntry[];
        };

        if (!Array.isArray(data.photos) || data.photos.length === 0) {
          return;
        }

        setLoadedPhotos((current) => {
          const nextPhotos = data.photos ?? [];
          const seen = new Set(current.map((photo) => photo.id));
          const deduped = nextPhotos.filter((photo) => !seen.has(photo.id));
          return deduped.length ? [...current, ...deduped] : current;
        });
      } catch {
        // ignore fetch errors and keep current list
      }
    });
  }, [canPaginate, collectionSlug, hasMore, isPagePending, loadedPhotos.length]);

  useEffect(() => {
    setLoadedPhotos(photos);
  }, [photos]);

  const filterSummary =
    canFilter && deferredFilter !== "all"
      ? `Showing ${new Intl.NumberFormat("en-US").format(visiblePhotos.length)} loaded frames`
      : `${new Intl.NumberFormat("en-US").format(visiblePhotos.length)} of ${new Intl.NumberFormat("en-US").format(totalAvailable)} frames loaded`;
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
                      !loadedPhotos.some((photo) => photo.id === activePhotoId && matchesFilter(photo, option.value))
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
        {visiblePhotos.map((photo, index) => {
          const card = (
            <article key={photo.id} className="photo-card">
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
                      src={photo.previewSrc}
                      srcSet={photo.previewSrcSet}
                      sizes="(max-width: 720px) 92vw, (max-width: 1280px) 48vw, 32vw"
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
                          src: photo.previewSrc,
                          title: photo.title,
                          index,
                        })
                      }
                    />
                    <span className="photo-overlay">Open full size</span>
                  </div>
                </button>
              </div>
            </article>
          );

          if (!shouldReduceReveal || index < REVEAL_LIMIT) {
            return (
              <ScrollReveal
                key={photo.id}
                delay={Math.min(index * 45, 260)}
                as="div"
              >
                {card}
              </ScrollReveal>
            );
          }

          return card;
        })}
      </div>

      {hasMore ? (
        <div className="photo-grid__more">
          <button
            type="button"
            className="photo-grid__more-button"
            onClick={loadMorePhotos}
            disabled={isPagePending}
          >
            {isPagePending ? "Loading..." : "Load more frames"}
          </button>
        </div>
      ) : null}

      {galleryCta}
      {typeof document !== "undefined" ? createPortal(lightbox, document.body) : null}
    </>
  );
}
