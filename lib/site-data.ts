export type CollectionDefinition = {
  slug: string;
  sourceFolder: string;
  collectionName: string;
  businessName: string;
  businessHandle: string;
  siteName: string;
  shortName: string;
  eyebrow: string;
  eventDate: string;
  eventDateValue: string;
  tagline: string;
  intro: string;
  availability: string;
  teamName: string;
  sport: string;
  eventName: string;
  instagramUrl: string;
  emailAddress: string;
  coverFilename: string;
};

export const collectionDefinitions: CollectionDefinition[] = [
  {
    slug: "shook-2026",
    sourceFolder: "shook 2026",
    collectionName: "SHOOKTOURN. DUSTINSSHOTS",
    businessName: "DUSTINSHOTSS",
    businessHandle: "dustinshotss",
    siteName: "Dustin Lapuz",
    shortName: "Dustin Lapuz",
    eyebrow: "Flag Football Collection",
    eventDate: "April 11th, 2026",
    eventDateValue: "2026-04-11",
    tagline: "SHOOK flag football tournament coverage focused on 702 Street Ballerz.",
    intro:
      "A tournament gallery built for easy browsing, quick popup viewing, and clean full-size downloads across phones and desktops.",
    availability:
      "Coverage for tournaments, team sessions, and action-driven event photography across Southern California and Las Vegas travel dates.",
    teamName: "702 Street Ballerz",
    sport: "Flag Football",
    eventName: "SHOOK Tournament 2026",
    instagramUrl: "https://www.instagram.com/dustinsshots/?__d=11%2F",
    emailAddress: "hello@dustinlapuz.com",
    coverFilename: "_DSC0043.jpg",
  },
  {
    slug: "haaheo-12u",
    sourceFolder: "haa'heo 12u",
    collectionName: "HAA'HEO 12U. DUSTINSSHOTS",
    businessName: "DUSTINSHOTSS",
    businessHandle: "dustinshhots",
    siteName: "Dustin Lapuz",
    shortName: "Dustin Lapuz",
    eyebrow: "Flag Football Collection",
    eventDate: "2026 Season",
    eventDateValue: "2026",
    tagline: "Another full tournament-style set, built from the new HAA'HEO 12U image folder.",
    intro:
      "A second full event gallery using the same popup viewer, full-size downloads, and clean browsing experience.",
    availability:
      "Coverage for tournaments, team sessions, and action-driven event photography across Southern California and Las Vegas travel dates.",
    teamName: "HAA'HEO 12U",
    sport: "Flag Football",
    eventName: "HAA'HEO 12U Collection",
    instagramUrl: "https://www.instagram.com/dustinsshots/?__d=11%2F",
    emailAddress: "hello@dustinlapuz.com",
    coverFilename: "_DSC0142.jpg",
  },
];

export const defaultCollectionSlug = "shook-2026";

export const siteConfig = {
  siteName: "DUSTINSHOTSS",
  shortName: "DUSTINSHOTSS",
  eyebrow: "Sports Collections",
  instagramUrl: "https://www.instagram.com/dustinsshots/?__d=11%2F",
  emailAddress: "hello@dustinlapuz.com",
};

export function getCollectionDefinition(slug = defaultCollectionSlug) {
  return collectionDefinitions.find((collection) => collection.slug === slug) ?? collectionDefinitions[0];
}
