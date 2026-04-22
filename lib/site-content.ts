import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  defaultCollectionSlug,
  getCollectionDefinition,
} from "@/lib/site-data";
import photoManifest from "@/lib/generated/photo-manifest.json";

export { collectionDefinitions, defaultCollectionSlug, getCollectionDefinition, siteConfig } from "@/lib/site-data";

export type PhotoOrientation = "portrait" | "landscape";

export type PhotoEntry = {
  id: string;
  filename: string;
  src: string;
  previewSrc: string;
  previewSrcSet: string;
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

const fileCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
const fallbackSupabaseUrl = "https://zsbjbmhdkqkkoniucfzg.supabase.co";
const supabaseStorageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "gallery";
const localPhotoManifest = photoManifest as Record<
  string,
  Array<{
    filename: string;
    width: number;
    height: number;
    orientation: PhotoOrientation;
    featured: boolean;
    sortOrder: number;
  }>
>;

function getSupabaseStorageBaseUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? fallbackSupabaseUrl;

  if (!supabaseUrl) {
    return null;
  }

  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${supabaseStorageBucket}`;
}

function getStoragePath(collectionSlug: string, filename: string) {
  return `${collectionSlug}/${encodeURIComponent(filename)}`;
}

export function getPhotoSrc(collectionSlug: string, filename: string) {
  const storageBaseUrl = getSupabaseStorageBaseUrl();

  if (!storageBaseUrl) {
    return `/collections/${collectionSlug}/${encodeURIComponent(filename)}`;
  }

  return `${storageBaseUrl}/${getStoragePath(collectionSlug, filename)}`;
}

function getPhotoPreviewBaseUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? fallbackSupabaseUrl;

  if (!supabaseUrl) {
    return null;
  }

  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/render/image/public/${supabaseStorageBucket}`;
}

export function getPhotoPreviewSources(collectionSlug: string, filename: string) {
  const previewBaseUrl = getPhotoPreviewBaseUrl();
  const storagePath = getStoragePath(collectionSlug, filename);

  if (!previewBaseUrl) {
    const localSrc = `/collections/${collectionSlug}/${encodeURIComponent(filename)}`;
    return {
      previewSrc: localSrc,
      previewSrcSet: `${localSrc} 900w`,
    };
  }

  const widths = [480, 720, 900];
  const buildSizedUrl = (width: number) => `${previewBaseUrl}/${storagePath}?width=${width}&quality=72&format=webp`;

  return {
    previewSrc: buildSizedUrl(widths[1]),
    previewSrcSet: widths.map((width) => `${buildSizedUrl(width)} ${width}w`).join(", "),
  };
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
  const manifestEntries = localPhotoManifest[collection.sourceFolder] ?? [];

  return manifestEntries.map((photo) => ({
    id: `${collection.slug}-${photo.filename}`,
    filename: photo.filename,
    src: getPhotoSrc(collection.slug, photo.filename),
    width: photo.width,
    height: photo.height,
    orientation: photo.orientation,
    defaultTitle: collection.teamName,
    defaultCaption: `${collection.teamName} at ${collection.eventName}`,
    featured: photo.featured,
    sortOrder: photo.sortOrder,
  }));
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
        ...getPhotoPreviewSources(collection.slug, photo.filename),
        alt: `${collection.teamName} during ${collection.eventName}. ${override?.caption?.trim() || photo.defaultCaption}`,
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

export async function getCollectionPhotoPage(
  collectionSlug = defaultCollectionSlug,
  offset = 0,
  limit = 48,
) {
  const photos = await getCollectionPhotos(collectionSlug);
  const startIndex = Math.max(0, offset);
  const boundedLimit = Math.min(Math.max(1, limit), 120);
  const page = photos.slice(startIndex, startIndex + boundedLimit);
  const nextOffset = startIndex + page.length;

  return {
    photos: page,
    total: photos.length,
    nextOffset,
    hasMore: nextOffset < photos.length,
  };
}

export const getFeaturedPhotos = cache(async (collectionSlug = defaultCollectionSlug) => {
  const photos = await getCollectionPhotos(collectionSlug);
  return photos.filter((photo) => photo.featured).slice(0, 12);
});
