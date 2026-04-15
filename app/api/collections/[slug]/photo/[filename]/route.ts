import { promises as fs } from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

import { getCollectionDefinition } from "@/lib/site-content";

function getContentType(filename: string) {
  const extension = path.extname(filename).toLowerCase();

  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  return "image/jpeg";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; filename: string }> },
) {
  const { slug, filename } = await params;
  const collection = getCollectionDefinition(slug);

  if (collection.slug !== slug) {
    return NextResponse.json({ error: "Collection not found." }, { status: 404 });
  }

  const decodedFilename = decodeURIComponent(filename);
  const absolutePath = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "images",
    collection.sourceFolder,
    decodedFilename,
  );

  try {
    const file = await fs.readFile(absolutePath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": getContentType(decodedFilename),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }
}
