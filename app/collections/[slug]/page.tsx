import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { GalleryActions } from "@/components/gallery-actions";
import { PhotoGrid } from "@/components/photo-grid";
import { ReelMarquee } from "@/components/reel-marquee";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SiteHeader } from "@/components/site-header";
import { getCollectionDefinition, getCollectionPhotos } from "@/lib/site-content";

type CollectionPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollectionDefinition(slug);

  if (collection.slug !== slug) {
    notFound();
  }

  const photos = await getCollectionPhotos(collection.slug);
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const shareUrl = `${protocol}://${host}/collections/${collection.slug}`;
  const photoCount = new Intl.NumberFormat("en-US").format(photos.length);

  return (
    <div className="page-shell">
      <SiteHeader />
      <main id="main-content">
        <ScrollReveal delay={60}>
          <section className="gallery-hero section-panel">
            <p className="section-label">{collection.teamName}</p>
            <h1>{photoCount} event photos from {collection.teamName}, ready for full-size viewing and clean sharing.</h1>
            <p className="gallery-intro">{collection.intro}</p>
            <div className="hero-actions">
              <a href={collection.instagramUrl} target="_blank" rel="noopener noreferrer">
                DM Dustin
              </a>
            </div>
            <GalleryActions
              downloadHref={`/api/collections/${collection.slug}/download`}
              shareUrl={shareUrl}
              shareTitle={collection.collectionName}
              shareText={`${collection.teamName} gallery by Dustin`}
            />
          </section>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <ReelMarquee items={[collection.teamName, collection.eventName, `${photoCount} Photos`, "Full Size", "Download Ready"]} />
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
