"use client";

import Link from "next/link";
import {
  collectionDefinitions,
  defaultCollectionSlug,
  getCollectionDefinition,
  siteConfig,
} from "@/lib/site-data";

type CollectionSwitcherProps = {
  currentSlug: string;
};

export function CollectionSwitcher({ currentSlug }: CollectionSwitcherProps) {
  const primaryCollection = getCollectionDefinition(defaultCollectionSlug);
  const alternateCollections = collectionDefinitions.filter(
    (collection) => collection.slug !== currentSlug,
  );

  if (alternateCollections.length === 0) {
    return null;
  }

  return (
    <section className="gallery-preview section-panel">
      <div className="section-heading">
        <p className="section-label">Collections</p>
        <h2>Switch galleries without jumping back to the homepage.</h2>
      </div>

      <div className="showcase-grid">
        {currentSlug !== primaryCollection.slug ? (
          <Link href="/gallery" className="showcase-card">
            <div>
              <span className="showcase-card__eyebrow">{primaryCollection.eventDate}</span>
              <h3>{primaryCollection.teamName}</h3>
              <p>{primaryCollection.tagline}</p>
            </div>
            <p className="photo-meta">
              {primaryCollection.sport} · current gallery
            </p>
          </Link>
        ) : null}

        {alternateCollections.map((collection) => (
          <Link
            key={collection.slug}
            className="showcase-card"
            href={
              collection.slug === defaultCollectionSlug
                ? "/gallery"
                : `/collections/${collection.slug}`
            }
          >
            <div>
              <span className="showcase-card__eyebrow">{collection.eventDate}</span>
              <h3>{collection.teamName}</h3>
              <p>{collection.tagline}</p>
            </div>
            <p className="photo-meta">
              {collection.sport} · {collection.eventName}
            </p>
          </Link>
        ))}
      </div>

      <p className="gallery-warning" role="note">
        Need help opening a gallery on mobile?{" "}
        <a href={`mailto:${siteConfig.emailAddress}?subject=Sports photography gallery issue`}>
          Contact Dustin
        </a>
        .
      </p>
    </section>
  );
}
