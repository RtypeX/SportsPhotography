import { NextResponse } from "next/server";

import { getCollectionDefinition, getPhotoSrc } from "@/lib/site-content";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; filename: string }> },
) {
  const { slug, filename } = await params;
  const collection = getCollectionDefinition(slug);

  if (collection.slug !== slug) {
    return NextResponse.json({ error: "Collection not found." }, { status: 404 });
  }

  const decodedFilename = decodeURIComponent(filename);
  return NextResponse.redirect(new URL(getPhotoSrc(collection.slug, decodedFilename), request.url), 307);
}
