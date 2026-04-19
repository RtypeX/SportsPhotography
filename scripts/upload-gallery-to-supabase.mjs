import { promises as fs } from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";
import { collectionFolderToSlug } from "./gallery-config.mjs";

const projectRoot = process.cwd();
const imagesRoot = path.join(projectRoot, "images");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName =
  process.env.SUPABASE_STORAGE_BUCKET ??
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ??
  "gallery";
const upsert = process.env.SUPABASE_UPLOAD_UPSERT !== "false";

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to your environment before uploading.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

function getContentType(filename) {
  const extension = path.extname(filename).toLowerCase();

  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  return "image/jpeg";
}

async function uploadCollection(sourceFolder, slug) {
  const sourceDirectory = path.join(imagesRoot, sourceFolder);
  const files = (await fs.readdir(sourceDirectory))
    .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" }));

  console.log(`Uploading ${files.length} files from "${sourceFolder}" to ${bucketName}/${slug}/`);

  for (const [index, filename] of files.entries()) {
    const storagePath = `${slug}/${filename}`;
    const fileBuffer = await fs.readFile(path.join(sourceDirectory, filename));
    const { error } = await supabase.storage.from(bucketName).upload(storagePath, fileBuffer, {
      contentType: getContentType(filename),
      upsert,
      cacheControl: "31536000",
    });

    if (error) {
      throw new Error(`Failed to upload ${storagePath}: ${error.message}`);
    }

    console.log(`[${index + 1}/${files.length}] ${storagePath}`);
  }
}

async function main() {
  for (const [sourceFolder, slug] of Object.entries(collectionFolderToSlug)) {
    await uploadCollection(sourceFolder, slug);
  }

  console.log("Finished uploading gallery files to Supabase Storage.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
