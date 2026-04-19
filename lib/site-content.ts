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
  previewSrcSet?: string;
  viewerSrc: string;
  viewerSrcSet?: string;
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
const previewWidths = [240, 360, 480, 640, 768, 960];
const viewerWidths = [720, 960, 1280, 1600, 2048];
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

function getSupabaseRenderBaseUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? fallbackSupabaseUrl;

  if (!supabaseUrl) {
    return null;
  }

  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/render/image/public/${supabaseStorageBucket}`;
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

type TransformOptions = {
  width: number;
  quality?: number;
  resize?: "cover" | "contain" | "fill";
};

function getTransformedPhotoSrc(
  collectionSlug: string,
  filename: string,
  { width, quality = 68, resize = "cover" }: TransformOptions,
) {
  const renderBaseUrl = getSupabaseRenderBaseUrl();

  if (!renderBaseUrl) {
    return getPhotoSrc(collectionSlug, filename);
  }

  const url = new URL(`${renderBaseUrl}/${getStoragePath(collectionSlug, filename)}`);
  url.searchParams.set("width", String(width));
  url.searchParams.set("quality", String(quality));
  url.searchParams.set("resize", resize);
  return url.toString();
}

function getResponsivePhotoSources(
  collectionSlug: string,
  filename: string,
  intrinsicWidth: number,
  widths: number[],
  quality: number,
  resize: "cover" | "contain" | "fill" = "cover",
) {
  const candidates = [...new Set(widths.filter((width) => width < intrinsicWidth).concat(intrinsicWidth))]
    .filter((width) => width > 0)
    .sort((left, right) => left - right);

  if (candidates.length === 0) {
    const originalSrc = getPhotoSrc(collectionSlug, filename);
    return {
      src: originalSrc,
      srcSet: undefined,
    };
  }

  return {
    src: getTransformedPhotoSrc(collectionSlug, filename, {
      width: candidates[0],
      quality,
      resize,
    }),
    srcSet: candidates
      .map((width) => `${getTransformedPhotoSrc(collectionSlug, filename, { width, quality, resize })} ${width}w`)
      .join(", "),
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

  return manifestEntries.map((photo) => {
    const previewSource = getResponsivePhotoSources(
      collection.slug,
      photo.filename,
      photo.width,
      previewWidths,
      58,
      "cover",
    );
    const viewerSource = getResponsivePhotoSources(
      collection.slug,
      photo.filename,
      photo.width,
      viewerWidths,
      78,
      "contain",
    );

    return {
      id: `${collection.slug}-${photo.filename}`,
      filename: photo.filename,
      src: getPhotoSrc(collection.slug, photo.filename),
      previewSrc: previewSource.src,
      previewSrcSet: previewSource.srcSet,
      viewerSrc: viewerSource.src,
      viewerSrcSet: viewerSource.srcSet,
      width: photo.width,
      height: photo.height,
      orientation: photo.orientation,
      defaultTitle: collection.teamName,
      defaultCaption: `${collection.teamName} at ${collection.eventName}`,
      featured: photo.featured,
      sortOrder: photo.sortOrder,
    };
  });
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
        previewSrc: photo.previewSrc,
        previewSrcSet: photo.previewSrcSet,
        viewerSrc: photo.viewerSrc,
        viewerSrcSet: photo.viewerSrcSet,
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

export const getFeaturedPhotos = cache(async (collectionSlug = defaultCollectionSlug) => {
  const photos = await getCollectionPhotos(collectionSlug);
  return photos.filter((photo) => photo.featured).slice(0, 12);
});
