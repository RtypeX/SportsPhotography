import type { Metadata } from "next";
import Image from "next/image";

import { PhotoGrid } from "@/components/photo-grid";
import { PortfolioScene } from "@/components/portfolio-scene";
import { ReelMarquee } from "@/components/reel-marquee";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SiteHeader } from "@/components/site-header";
import {
  collectionDefinitions,
  defaultCollectionSlug,
  getCollectionDefinition,
  getCollectionPhotos,
  getCoverImage,
  getFeaturedPhotos,
  siteConfig,
} from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Sports Photography Galleries",
  description:
    "Sports photography by Dustin Lapuz featuring cinematic event galleries, full-size downloads, and mobile-friendly proofing for teams and families.",
};

export default async function Home() {
  const primaryCollection = getCollectionDefinition(defaultCollectionSlug);
  const featuredPhotos = await getFeaturedPhotos(primaryCollection.slug);
  const collectionPhotos = await getCollectionPhotos(primaryCollection.slug);
  const leadPhoto = featuredPhotos[0] ?? collectionPhotos[0];
  const secondaryCollections = collectionDefinitions.filter(
    (collection) => collection.slug !== primaryCollection.slug,
  );
  const photoCount = new Intl.NumberFormat("en-US").format(collectionPhotos.length);
  const featuredCount = new Intl.NumberFormat("en-US").format(featuredPhotos.length);
  const bookingHref = `mailto:${siteConfig.emailAddress}?subject=Sports photography coverage inquiry`;
  const reelItems = [
    primaryCollection.teamName,
    primaryCollection.eventName,
    primaryCollection.sport,
    `${photoCount} Frames`,
    "Popup Viewing",
    "Full-Size Downloads",
  ];

  return (
    <div className="page-shell">
      <SiteHeader />
      <main id="main-content">
        <section className="collection-cover collection-cover--intro">
          <Image
            src={getCoverImage(primaryCollection.slug)}
            alt={`${primaryCollection.teamName} competing at ${primaryCollection.eventName}`}
            fill
            priority
            sizes="(max-width: 1260px) 100vw, 1240px"
            className="collection-cover__image"
          />
          <div className="collection-cover__shade" aria-hidden="true" />
          <div className="collection-cover__content">
            <p className="section-label">{primaryCollection.teamName}</p>
            <h1>{primaryCollection.collectionName}</h1>
            <time className="collection-cover__date" dateTime={primaryCollection.eventDateValue}>
              {primaryCollection.eventDate}
            </time>
            <p className="collection-cover__lede">{primaryCollection.tagline}</p>
            <div className="hero-actions">
              <a href="/gallery">Open full gallery</a>
              <a href={primaryCollection.instagramUrl} target="_blank" rel="noopener noreferrer">
                DM Dustin
              </a>
            </div>
            <div className="collection-cover__stats">
              <div>
                <span>Latest gallery</span>
                <strong>{photoCount} tournament frames</strong>
              </div>
              <div>
                <span>Delivery</span>
                <strong>Large previews and original downloads</strong>
              </div>
            </div>
          </div>
        </section>

        <ScrollReveal delay={120}>
          <section className="hero hero-panel">
            <ScrollReveal delay={150}>
              <div className="hero-intro-block">
                <p className="section-label">{primaryCollection.eyebrow}</p>
                <h2>Coverage that still feels fast once the game is over.</h2>
                <p className="hero-tagline">
                  Event galleries built for athletes, families, and teams who want the right frame
                  without hunting through clutter.
                </p>
                <p className="hero-intro">{primaryCollection.availability}</p>
                <div className="hero-actions">
                  <a href={bookingHref}>Book coverage</a>
                  <a href={primaryCollection.instagramUrl} target="_blank" rel="noopener noreferrer">
                    View Instagram
                  </a>
                </div>

                <div className="hero-points">
                  <div>
                    <span className="hero-points__value">{featuredCount}</span>
                    <p>
                      Featured frames are surfaced first so the biggest plays land quickly on phones
                      and laptops.
                    </p>
                  </div>
                  <div>
                    <span className="hero-points__value">Full res</span>
                    <p>
                      Every image opens large, downloads cleanly, and stays easy to share with the
                      rest of the team.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={210}>
              <div className="hero-stage">
                <PortfolioScene photo={leadPhoto} titleOverride="shook tournments" />
              </div>
            </ScrollReveal>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={160}>
          <ReelMarquee items={reelItems} />
        </ScrollReveal>

        <ScrollReveal delay={220}>
          <section className="process-band section-panel">
            <div className="section-heading">
              <p className="section-label">What clients get</p>
              <h2>One gallery flow from first whistle to final download.</h2>
            </div>
            <div className="process-grid">
              <div>
                <h3>Fast browsing</h3>
                <p>
                  The strongest moments are easy to find first, then the full archive stays simple
                  to move through without losing your place.
                </p>
              </div>
              <div>
                <h3>Ready to send</h3>
                <p>
                  Original-size downloads and shareable gallery links make it easy to pass images to
                  players, parents, and coaches.
                </p>
              </div>
              <div>
                <h3>Travel coverage</h3>
                <p>{primaryCollection.availability}</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={240}>
          <section className="gallery-preview section-panel">
            <div className="section-heading">
              <p className="section-label">Collections</p>
              <h2>Start with the current drop, then jump into the rest of the archive.</h2>
            </div>
            <div className="gallery-preview__panel">
              <div>
                <p className="photo-meta">Current gallery</p>
                <p className="hero-caption__title">{primaryCollection.collectionName}</p>
                <p>
                  {primaryCollection.teamName} at {primaryCollection.eventName}, optimized for quick
                  proofing and download-ready delivery.
                </p>
              </div>
              <a href="/gallery">Open the full gallery</a>
            </div>
            <div className="showcase-grid">
              <a href="/gallery" className="showcase-card showcase-card--wide">
                <div>
                  <span className="showcase-card__eyebrow">{primaryCollection.eventDate}</span>
                  <h3>{primaryCollection.teamName}</h3>
                  <p>{primaryCollection.tagline}</p>
                </div>
                <p className="photo-meta">
                  {primaryCollection.sport} · {photoCount} frames
                </p>
              </a>
              {secondaryCollections.map((collection) => (
                <a
                  key={collection.slug}
                  href={`/collections/${collection.slug}`}
                  className="showcase-card"
                >
                  <div>
                    <span className="showcase-card__eyebrow">{collection.eventDate}</span>
                    <h3>{collection.teamName}</h3>
                    <p>{collection.tagline}</p>
                  </div>
                  <p className="photo-meta">
                    {collection.sport} · {collection.eventName}
                  </p>
                </a>
              ))}
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={260}>
          <section className="featured-strip section-panel" id="featured">
            <ScrollReveal delay={80}>
              <div className="section-heading">
                <p className="section-label">Highlights</p>
                <h2>
                  Featured tournament frames from {primaryCollection.teamName}, surfaced first for
                  quick proofing and faster sharing.
                </h2>
              </div>
            </ScrollReveal>
            <PhotoGrid photos={featuredPhotos.slice(0, 6)} compact collection showGalleryCta={false} />
          </section>
        </ScrollReveal>

        <ScrollReveal delay={280}>
          <section className="contact-band section-panel" id="contact">
            <p className="section-label">Book coverage</p>
            <h2>Need tournament coverage, sideline portraits, or a gallery the whole team can use?</h2>
            <p>{primaryCollection.availability}</p>
            <div className="contact-band__actions">
              <a href={bookingHref}>Email Dustin</a>
              <a href={siteConfig.instagramUrl} target="_blank" rel="noopener noreferrer">
                Message on Instagram
              </a>
            </div>
          </section>
        </ScrollReveal>
      </main>
    </div>
  );
}
