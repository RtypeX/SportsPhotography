"use client";

import { useRouter } from "next/navigation";
import {
  collectionDefinitions,
  defaultCollectionSlug,
  getCollectionDefinition,
} from "@/lib/site-data";

type CollectionSwitcherProps = {
  currentSlug: string;
};

export function CollectionSwitcher({ currentSlug }: CollectionSwitcherProps) {
  const router = useRouter();
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
          <button
            type="button"
            className="showcase-card"
            onClick={() => router.push("/gallery")}
          >
            <div>
              <span className="showcase-card__eyebrow">{primaryCollection.eventDate}</span>
              <h3>{primaryCollection.teamName}</h3>
              <p>{primaryCollection.tagline}</p>
            </div>
            <p className="photo-meta">
              {primaryCollection.sport} · current gallery
            </p>
          </button>
        ) : null}

        {alternateCollections.map((collection) => (
          <button
            key={collection.slug}
            type="button"
            className="showcase-card"
            onClick={() =>
              router.push(
                collection.slug === defaultCollectionSlug ? "/gallery" : `/collections/${collection.slug}`,
              )
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
          </button>
        ))}
      </div>
    </section>
  );
}
