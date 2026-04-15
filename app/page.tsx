import Link from "next/link";

import { PhotoGrid } from "@/components/photo-grid";
import { PortfolioScene } from "@/components/portfolio-scene";
import { ReelMarquee } from "@/components/reel-marquee";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SiteHeader } from "@/components/site-header";
import {
  defaultCollectionSlug,
  getCollectionDefinition,
  getCollectionPhotos,
  getCoverImage,
  getFeaturedPhotos,
} from "@/lib/site-content";

export default async function Home() {
  const primaryCollection = getCollectionDefinition(defaultCollectionSlug);
  const featuredPhotos = await getFeaturedPhotos(primaryCollection.slug);
  const collectionPhotos = await getCollectionPhotos(primaryCollection.slug);
  const leadPhoto = featuredPhotos[0] ?? collectionPhotos[0];
  const reelItems = [
    primaryCollection.teamName,
    primaryCollection.eventName,
    primaryCollection.sport,
    `${collectionPhotos.length} Frames`,
    "Popup Viewing",
    "Full-Size Downloads",
  ];

  return (
    <div className="page-shell">
      <SiteHeader />
      <main id="main-content">
        <section
          className="collection-cover collection-cover--intro"
          style={{
            backgroundImage: `url(${getCoverImage(primaryCollection.slug)})`,
          }}
        >
          <div className="collection-cover__shade" aria-hidden="true" />
          <div className="collection-cover__content">
            <p className="section-label">{primaryCollection.teamName}</p>
            <h1>{primaryCollection.collectionName}</h1>
            <time className="collection-cover__date" dateTime={primaryCollection.eventDateValue}>
              {primaryCollection.eventDate}
            </time>
            <div className="hero-actions">
              <Link href="/gallery">Open full gallery</Link>
              <a href={primaryCollection.instagramUrl} target="_blank" rel="noopener noreferrer">
                DM Dustin
              </a>
            </div>
          </div>
        </section>

        <ScrollReveal delay={120}>
          <section className="hero hero-panel">
            <ScrollReveal delay={150}>
              <div className="hero-intro-block">
                <p className="section-label">{primaryCollection.eyebrow}</p>
                <h2>{primaryCollection.siteName}</h2>
                <p className="hero-tagline">{primaryCollection.tagline}</p>
                <p className="hero-intro">{primaryCollection.intro}</p>
                <div className="hero-actions">
                  <a href={primaryCollection.instagramUrl} target="_blank" rel="noopener noreferrer">
                    View Instagram
                  </a>
                </div>

                <div className="hero-points">
                  <div>
                    <span className="hero-points__value">01</span>
                    <p>Collection cover, animated gallery framing, and real tournament imagery presented in a cleaner event-focused layout.</p>
                  </div>
                  <div>
                    <span className="hero-points__value">02</span>
                    <p>Built to feel smooth on phones and desktop screens, with full-size viewing and fast downloads for every frame.</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={210}>
              <div className="hero-stage">
                <PortfolioScene photo={leadPhoto} />
              </div>
            </ScrollReveal>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={160}>
          <ReelMarquee items={reelItems} />
        </ScrollReveal>

        <ScrollReveal delay={220}>
          <section className="featured-strip section-panel" id="featured">
            <ScrollReveal delay={80}>
              <div className="section-heading">
                <p className="section-label">Highlights</p>
                <h2>Featured tournament frames from 702 Street Ballerz, shown in a denser collection layout inspired by hosted proofing galleries.</h2>
              </div>
            </ScrollReveal>
            <PhotoGrid photos={featuredPhotos.slice(0, 6)} compact collection showGalleryCta={false} />
          </section>
        </ScrollReveal>
      </main>
    </div>
  );
}
