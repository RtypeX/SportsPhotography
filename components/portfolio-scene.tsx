"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";

import type { PhotoEntry } from "@/lib/site-content";

type PortfolioSceneProps = {
  photo: PhotoEntry;
};

export function PortfolioScene({ photo }: PortfolioSceneProps) {
  const [style, setStyle] = useState<CSSProperties>({
    "--pointer-x": "50%",
    "--pointer-y": "50%",
  } as CSSProperties);

  return (
    <div
      className="portfolio-scene"
      style={style}
      onMouseMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = ((event.clientY - bounds.top) / bounds.height) * 100;

        setStyle({
          "--pointer-x": `${x}%`,
          "--pointer-y": `${y}%`,
        } as CSSProperties);
      }}
      onMouseLeave={() =>
        setStyle({
          "--pointer-x": "50%",
          "--pointer-y": "50%",
        } as CSSProperties)
      }
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
          <Image
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            className="portfolio-scene__image"
            priority
            sizes="(max-width: 900px) 100vw, 58vw"
            quality={100}
            unoptimized
          />
        </div>

        <div className="portfolio-scene__footer">
          <div>
            <p className="photo-meta">{photo.sport}</p>
            <p className="hero-caption__title">{photo.title}</p>
          </div>
          <p>
            {photo.event} · {photo.date}
          </p>
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
