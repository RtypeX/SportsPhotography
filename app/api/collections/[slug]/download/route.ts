import { promises as fs } from "node:fs";
import path from "node:path";
import { PassThrough, Readable } from "node:stream";

import archiver from "archiver";
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

  const directory = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "images",
    collection.sourceFolder,
  );

  const entries = await fs.readdir(directory);
  const files = entries.filter((file) => /\.(jpe?g|png|webp)$/i.test(file));

  if (!files.length) {
    return NextResponse.json({ error: "No files available." }, { status: 404 });
  }

  const archive = archiver("zip", {
    zlib: { level: 0 },
  });

  const stream = new PassThrough();
  archive.pipe(stream);

  files.forEach((file) => {
    archive.file(path.join(directory, file), { name: file });
  });

  void archive.finalize();

  return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${slug}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
