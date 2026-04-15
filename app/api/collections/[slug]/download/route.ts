import { NextResponse } from "next/server";

import { getCollectionDefinition } from "@/lib/site-content";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const collection = getCollectionDefinition(slug);

  if (collection.slug !== slug) {
    return NextResponse.json({ error: "Collection not found." }, { status: 404 });
  }

  return NextResponse.json(
    {
      error: "Bulk collection downloads are unavailable on this deployment. Download individual photos from the gallery viewer instead.",
    },
    { status: 410 },
  );
}
