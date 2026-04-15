import { cache } from "react";
import { promises as fs } from "node:fs";
import path from "node:path";

import { imageSizeFromFile } from "image-size/fromFile";
import { createClient } from "@supabase/supabase-js";
import {
  defaultCollectionSlug,
  getCollectionDefinition,
  type CollectionDefinition,
} from "@/lib/site-data";

export { collectionDefinitions, defaultCollectionSlug, getCollectionDefinition, siteConfig } from "@/lib/site-data";

export type PhotoOrientation = "portrait" | "landscape";

export type PhotoEntry = {
  id: string;
  filename: string;
  src: string;
  alt: string;
  title: string;
  caption: string;
  sport: string;
  event: string;
  date: string;
  featured: boolean;
  orientation?: PhotoOrientation;
  width: number;
  height: number;
  team: string;
  sortOrder: number;
  collectionSlug: string;
};

type PhotoOverride = {
  filename: string;
  title: string | null;
  caption: string | null;
  featured: boolean | null;
  sort_order: number | null;
};

const imagesRoot = path.join(process.cwd(), "images");
const fileCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

function getCollectionDirectory(collection: CollectionDefinition) {
  return path.join(imagesRoot, collection.sourceFolder);
}

export function getPhotoSrc(collectionSlug: string, filename: string) {
  return `/api/collections/${collectionSlug}/photo/${encodeURIComponent(filename)}`;
}

export function getCoverImage(collectionSlug = defaultCollectionSlug) {
  const collection = getCollectionDefinition(collectionSlug);
  return getPhotoSrc(collection.slug, collection.coverFilename);
}

function createPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

const getPhotoOverrides = cache(async (collectionSlug: string) => {
  const supabase = createPublicSupabaseClient();

  if (!supabase) {
    return new Map<string, PhotoOverride>();
  }

  const { data, error } = await supabase
    .from("collection_photos")
    .select("filename,title,caption,featured,sort_order")
    .eq("collection_slug", collectionSlug);

  if (error || !data) {
    return new Map<string, PhotoOverride>();
  }

  return new Map(data.map((item) => [item.filename, item as PhotoOverride]));
});

const getLocalPhotos = cache(async (collectionSlug: string) => {
  const collection = getCollectionDefinition(collectionSlug);
  const directory = getCollectionDirectory(collection);
  const files = await fs.readdir(directory);

  return Promise.all(
    files
      .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
      .sort((left, right) => fileCollator.compare(left, right))
      .map(async (filename, index) => {
        const absolutePath = path.join(directory, filename);
        const dimensions = await imageSizeFromFile(absolutePath);
        const width = dimensions.width ?? 1200;
        const height = dimensions.height ?? 1600;
        const orientation: PhotoOrientation = width >= height ? "landscape" : "portrait";

        return {
          id: `${collection.slug}-${filename}`,
          filename,
          src: getPhotoSrc(collection.slug, filename),
          width,
          height,
          orientation,
          defaultTitle: collection.teamName,
          defaultCaption: `${collection.teamName} at ${collection.eventName}`,
          featured: index < 12,
          sortOrder: index,
        };
      }),
  );
});

export const getCollectionPhotos = cache(async (collectionSlug = defaultCollectionSlug): Promise<PhotoEntry[]> => {
  const collection = getCollectionDefinition(collectionSlug);
  const [localPhotos, overrides] = await Promise.all([
    getLocalPhotos(collection.slug),
    getPhotoOverrides(collection.slug),
  ]);

  return localPhotos
    .map((photo) => {
      const override = overrides.get(photo.filename);

      return {
        id: photo.id,
        filename: photo.filename,
        src: photo.src,
        alt: `${collection.teamName} flag football action photo ${photo.filename}`,
        title: override?.title?.trim() || photo.defaultTitle,
        caption: override?.caption?.trim() || photo.defaultCaption,
        sport: collection.sport,
        event: collection.eventName,
        date: collection.eventDate,
        featured: override?.featured ?? photo.featured,
        orientation: photo.orientation,
        width: photo.width,
        height: photo.height,
        team: collection.teamName,
        sortOrder: override?.sort_order ?? photo.sortOrder,
        collectionSlug: collection.slug,
      };
    })
    .sort((left, right) => left.sortOrder - right.sortOrder || fileCollator.compare(left.filename, right.filename));
});

export const getFeaturedPhotos = cache(async (collectionSlug = defaultCollectionSlug) => {
  const photos = await getCollectionPhotos(collectionSlug);
  return photos.filter((photo) => photo.featured).slice(0, 12);
});
