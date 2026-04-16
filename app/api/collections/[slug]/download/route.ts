import { stat } from "node:fs/promises";
import path from "node:path";
import { PassThrough, Readable } from "node:stream";

import archiver from "archiver";
import { NextResponse } from "next/server";

import { getCollectionDefinition } from "@/lib/site-content";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const collection = getCollectionDefinition(slug);

  if (collection.slug !== slug) {
    return NextResponse.json({ error: "Collection not found." }, { status: 404 });
  }

  const collectionDirectory = path.join(process.cwd(), "public", "collections", collection.slug);

  try {
    await stat(collectionDirectory);
  } catch {
    return NextResponse.json(
      {
        error: "Collection files are not prepared on this deployment yet.",
      },
      { status: 503 },
    );
  }

  const zipStream = new PassThrough();
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  archive.on("error", (error) => {
    zipStream.destroy(error);
  });

  archive.pipe(zipStream);
  archive.directory(collectionDirectory, false);
  void archive.finalize();

  return new Response(Readable.toWeb(zipStream) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${collection.slug}-gallery.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
