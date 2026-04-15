import { promises as fs } from "node:fs";
import path from "node:path";

import { imageSizeFromFile } from "image-size/fromFile";

const projectRoot = process.cwd();
const imagesRoot = path.join(projectRoot, "images");
const publicCollectionsRoot = path.join(projectRoot, "public", "collections");
const manifestPath = path.join(projectRoot, "lib", "generated", "photo-manifest.json");

const collectionFolderToSlug = {
  "shook 2026": "shook-2026",
  "haa'heo 12u": "haaheo-12u",
};

const fileCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

async function ensureDirectory(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });
}

async function buildCollectionManifest(sourceFolder) {
  const collectionDirectory = path.join(imagesRoot, sourceFolder);
  const files = await fs.readdir(collectionDirectory);
  const imageFiles = files
    .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
    .sort((left, right) => fileCollator.compare(left, right));

  return Promise.all(
    imageFiles.map(async (filename, index) => {
      const absolutePath = path.join(collectionDirectory, filename);
      const dimensions = await imageSizeFromFile(absolutePath);
      const width = dimensions.width ?? 1200;
      const height = dimensions.height ?? 1600;

      return {
        filename,
        width,
        height,
        orientation: width >= height ? "landscape" : "portrait",
        featured: index < 12,
        sortOrder: index,
      };
    }),
  );
}

async function syncCollectionAssets(sourceFolder, slug) {
  const sourceDirectory = path.join(imagesRoot, sourceFolder);
  const targetDirectory = path.join(publicCollectionsRoot, slug);

  await fs.rm(targetDirectory, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  await fs.cp(sourceDirectory, targetDirectory, {
    recursive: true,
    force: true,
  });
}

async function main() {
  await ensureDirectory(publicCollectionsRoot);
  await ensureDirectory(path.dirname(manifestPath));

  const manifest = {};

  for (const [sourceFolder, slug] of Object.entries(collectionFolderToSlug)) {
    manifest[sourceFolder] = await buildCollectionManifest(sourceFolder);
    await syncCollectionAssets(sourceFolder, slug);
  }

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

main().catch((error) => {
  console.error("Failed to prepare gallery assets.");
  console.error(error);
  process.exitCode = 1;
});
