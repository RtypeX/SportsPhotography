import { promises as fs } from "node:fs";
import path from "node:path";

import { collectionFolderToSlug } from "./gallery-config.mjs";

const projectRoot = process.cwd();
const manifestPath = path.join(projectRoot, "lib", "generated", "photo-manifest.json");
const fallbackSupabaseUrl = "https://zsbjbmhdkqkkoniucfzg.supabase.co";
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? fallbackSupabaseUrl).replace(/\/$/, "");
const bucketName =
  process.env.SUPABASE_STORAGE_BUCKET ??
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ??
  "gallery";
const perCollectionLimit = Number.parseInt(process.env.SUPABASE_CHECK_LIMIT_PER_COLLECTION ?? "0", 10);
const timeoutMs = Number.parseInt(process.env.SUPABASE_CHECK_TIMEOUT_MS ?? "12000", 10);

function buildPhotoUrl(slug, filename) {
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${slug}/${encodeURIComponent(filename)}`;
}

async function loadManifest() {
  const file = await fs.readFile(manifestPath, "utf8");
  return JSON.parse(file);
}

async function checkUrl(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });

    return {
      ok: response.ok,
      status: response.status,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const manifest = await loadManifest();
  const failures = [];

  for (const [sourceFolder, slug] of Object.entries(collectionFolderToSlug)) {
    const manifestEntries = manifest[sourceFolder] ?? [];
    const entriesToCheck =
      perCollectionLimit > 0 ? manifestEntries.slice(0, perCollectionLimit) : manifestEntries;

    console.log(`Checking ${entriesToCheck.length} files for ${slug}...`);

    for (const photo of entriesToCheck) {
      const url = buildPhotoUrl(slug, photo.filename);
      const result = await checkUrl(url);

      if (!result.ok) {
        failures.push({
          slug,
          filename: photo.filename,
          url,
          ...result,
        });

        console.error(`FAIL ${slug}/${photo.filename} -> ${result.status || result.error}`);
      }
    }
  }

  if (failures.length > 0) {
    console.error(`\nFound ${failures.length} missing or failing gallery files.`);
    process.exit(1);
  }

  console.log("\nAll checked gallery files responded successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
