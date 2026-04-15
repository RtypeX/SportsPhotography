import type { Metadata } from "next";

import { CollectionSwitcher } from "@/components/collection-switcher";
import { GalleryActions } from "@/components/gallery-actions";
import { PhotoGrid } from "@/components/photo-grid";
import { ReelMarquee } from "@/components/reel-marquee";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SiteHeader } from "@/components/site-header";
import { defaultCollectionSlug, getCollectionDefinition, getCollectionPhotos } from "@/lib/site-content";
import { buildCollectionMetadata } from "@/lib/metadata";

const collection = getCollectionDefinition(defaultCollectionSlug);

export const metadata: Metadata = buildCollectionMetadata(collection);

export default async function GalleryPage() {
  const photos = await getCollectionPhotos(collection.slug);
  const photoCount = new Intl.NumberFormat("en-US").format(photos.length);

  return (
    <div className="page-shell">
      <SiteHeader />
      <main id="main-content">
        <ScrollReveal delay={60}>
          <section className="gallery-hero section-panel">
            <p className="section-label">{collection.teamName}</p>
            <h1>{photoCount} real tournament photos, all viewable in popups and downloadable at full size.</h1>
            <p className="gallery-intro">
              Browse the full event archive, open any image in a popup, and download the original-size files whenever you need them.
            </p>
            <div className="hero-actions">
              <a href={collection.instagramUrl} target="_blank" rel="noopener noreferrer">
                DM Dustin
              </a>
            </div>
            <GalleryActions
              shareTitle={collection.collectionName}
              shareText={`${collection.teamName} at ${collection.eventName}`}
            />
          </section>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <ReelMarquee items={[collection.eventName, collection.teamName, `${photoCount} Photos`, "Popup Viewer", "Download Ready"]} />
        </ScrollReveal>

        <ScrollReveal delay={180}>
          <CollectionSwitcher currentSlug={collection.slug} />
        </ScrollReveal>

        <ScrollReveal delay={220}>
          <section className="gallery-section section-panel">
            <PhotoGrid photos={photos} collection />
          </section>
        </ScrollReveal>
      </main>
    </div>
  );
}
