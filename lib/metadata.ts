import type { Metadata } from "next";

import type { CollectionDefinition } from "@/lib/site-data";
import { siteConfig } from "@/lib/site-data";

export function buildCollectionMetadata(collection: CollectionDefinition): Metadata {
  const title = `${collection.teamName} Gallery`;
  const description = `${collection.teamName} at ${collection.eventName}. Browse full-size ${collection.sport.toLowerCase()} photos, highlights, and download-ready frames by Dustin Lapuz.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${siteConfig.shortName}`,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.shortName}`,
      description,
    },
  };
}
