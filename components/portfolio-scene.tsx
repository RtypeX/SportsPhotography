"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";

import type { PhotoEntry } from "@/lib/site-content";
import { reportMobileDebug } from "@/lib/mobile-debug";

type PortfolioSceneProps = {
  photo: PhotoEntry;
  titleOverride?: string;
};

export function PortfolioScene({ photo, titleOverride }: PortfolioSceneProps) {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const usesRemoteImage = photo.src.startsWith("http");

  return (
    <div
      ref={sceneRef}
      className="portfolio-scene"
      style={{ "--pointer-x": "50%", "--pointer-y": "50%" } as CSSProperties}
      onMouseMove={(event) => {
        if (!sceneRef.current) {
          return;
        }

        const bounds = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = ((event.clientY - bounds.top) / bounds.height) * 100;

        sceneRef.current.style.setProperty("--pointer-x", `${x}%`);
        sceneRef.current.style.setProperty("--pointer-y", `${y}%`);
      }}
      onMouseLeave={() => {
        sceneRef.current?.style.setProperty("--pointer-x", "50%");
        sceneRef.current?.style.setProperty("--pointer-y", "50%");
      }}
    >
      <Image
        src="/assets/track-lines.svg"
        alt=""
        width={900}
        height={700}
        className="portfolio-scene__lines"
        aria-hidden="true"
      />
      <Image
        src="/assets/speed-arc.svg"
        alt=""
        width={320}
        height={320}
        className="portfolio-scene__arc"
        aria-hidden="true"
      />
      <Image
        src="/assets/reticle.svg"
        alt=""
        width={160}
        height={160}
        className="portfolio-scene__reticle"
        aria-hidden="true"
      />

      <div className="portfolio-scene__frame">
        <div className="portfolio-scene__chrome">
          <span>DL</span>
          <span>Sports Vision</span>
        </div>

        <div className="portfolio-scene__media">
          {usesRemoteImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                className="portfolio-scene__image"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                onError={() =>
                  reportMobileDebug("portfolio-scene-image-error", {
                    photoId: photo.id,
                    collectionSlug: photo.collectionSlug,
                    src: photo.src,
                    title: photo.title,
                  })
                }
              />
            </>
          ) : (
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              className="portfolio-scene__image"
              priority
              sizes="(max-width: 900px) 100vw, 58vw"
              quality={92}
            />
          )}
          <div className="portfolio-scene__media-fade" aria-hidden="true" />
          <div className="portfolio-scene__footer">
            <div>
              <p className="photo-meta">{photo.sport}</p>
              <p className="hero-caption__title">{titleOverride ?? photo.title}</p>
            </div>
            <p>
              {photo.event} · {photo.date}
            </p>
          </div>
        </div>
      </div>

      <div className="portfolio-card portfolio-card--metric">
        <span className="portfolio-card__label">Coverage</span>
        <strong>Action, portraits, tunnel, sideline</strong>
      </div>

      <div className="portfolio-card portfolio-card--note">
        <span className="portfolio-card__label">Delivery</span>
        <strong>Tap any frame to view full size and download.</strong>
      </div>
    </div>
  );
}
