import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionSwitcher } from "@/components/collection-switcher";
import { GalleryActions } from "@/components/gallery-actions";
import { PhotoGrid } from "@/components/photo-grid";
import { ReelMarquee } from "@/components/reel-marquee";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SiteHeader } from "@/components/site-header";
import {
  collectionDefinitions,
  getCollectionDefinition,
  getCollectionPhotos,
} from "@/lib/site-content";
import { buildCollectionMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-data";

type CollectionPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return collectionDefinitions.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionDefinition(slug);

  if (collection.slug !== slug) {
    return {};
  }

  return buildCollectionMetadata(collection);
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollectionDefinition(slug);

  if (collection.slug !== slug) {
    notFound();
  }

  const photos = await getCollectionPhotos(collection.slug);
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
              <a href={`mailto:${siteConfig.emailAddress}?subject=Sports photography coverage inquiry`}>
                Email Dustin
              </a>
            </div>
            <GalleryActions
              downloadHref={`/api/collections/${collection.slug}/download`}
              shareTitle={collection.collectionName}
              shareText={`${collection.teamName} gallery by Dustin`}
            />
          </section>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <ReelMarquee items={[collection.teamName, collection.eventName, `${photoCount} Photos`, "Full Size", "Download Ready"]} />
        </ScrollReveal>

        <ScrollReveal delay={180}>
          <CollectionSwitcher currentSlug={collection.slug} />
        </ScrollReveal>

        <ScrollReveal delay={220}>
          <section className="gallery-section section-panel">
            <PhotoGrid photos={photos} collection />
          </section>
        </ScrollReveal>

        <ScrollReveal delay={260}>
          <section className="contact-band section-panel">
            <p className="section-label">Coverage</p>
            <h2>{collection.startingPrice} coverage with galleries that stay easy to browse on phones.</h2>
            <p>
              {collection.turnaround} {siteConfig.bookingResponseWindow}
            </p>
            <div className="contact-band__actions">
              <a href={`mailto:${siteConfig.emailAddress}?subject=Sports photography coverage inquiry`}>
                Email Dustin
              </a>
            </div>
          </section>
        </ScrollReveal>
      </main>
    </div>
  );
}
