import { headers } from "next/headers";

import { GalleryActions } from "@/components/gallery-actions";
import { PhotoGrid } from "@/components/photo-grid";
import { ReelMarquee } from "@/components/reel-marquee";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SiteHeader } from "@/components/site-header";
import { defaultCollectionSlug, getCollectionDefinition, getCollectionPhotos } from "@/lib/site-content";

export default async function GalleryPage() {
  const collection = getCollectionDefinition(defaultCollectionSlug);
  const photos = await getCollectionPhotos(collection.slug);
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const shareUrl = `${protocol}://${host}/gallery`;
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
              downloadHref={`/api/collections/${collection.slug}/download`}
              shareUrl={shareUrl}
              shareTitle={collection.collectionName}
              shareText={`${collection.teamName} at ${collection.eventName}`}
            />
          </section>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <ReelMarquee items={[collection.eventName, collection.teamName, `${photoCount} Photos`, "Popup Viewer", "Download Ready"]} />
        </ScrollReveal>

        <ScrollReveal delay={180}>
          <section className="gallery-section section-panel">
            <PhotoGrid photos={photos} collection />
          </section>
        </ScrollReveal>
      </main>
    </div>
  );
}
