import { NextResponse } from "next/server";

import { getCollectionDefinition, getCollectionPhotoPage } from "@/lib/site-content";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const collection = getCollectionDefinition(slug);

  if (collection.slug !== slug) {
    return NextResponse.json({ error: "Collection not found." }, { status: 404 });
  }

  const url = new URL(request.url);
  const offset = Number.parseInt(url.searchParams.get("offset") ?? "0", 10);
  const limit = Number.parseInt(url.searchParams.get("limit") ?? "48", 10);
  const page = await getCollectionPhotoPage(collection.slug, offset, limit);

  return NextResponse.json(page);
}
