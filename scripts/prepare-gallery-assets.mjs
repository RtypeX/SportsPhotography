import { promises as fs } from "node:fs";
import path from "node:path";

import { imageSizeFromFile } from "image-size/fromFile";
import { collectionFolderToSlug } from "./gallery-config.mjs";

const projectRoot = process.cwd();
const imagesRoot = path.join(projectRoot, "images");
const manifestPath = path.join(projectRoot, "lib", "generated", "photo-manifest.json");

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

async function main() {
  await ensureDirectory(path.dirname(manifestPath));

  const manifest = {};

  for (const [sourceFolder] of Object.entries(collectionFolderToSlug)) {
    manifest[sourceFolder] = await buildCollectionManifest(sourceFolder);
  }

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

main().catch((error) => {
  console.error("Failed to prepare gallery assets.");
  console.error(error);
  process.exitCode = 1;
});
