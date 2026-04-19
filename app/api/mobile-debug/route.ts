import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent");
  const forwardedFor = request.headers.get("x-forwarded-for");
  const referer = request.headers.get("referer");

  console.error(
    "[mobile-debug]",
    JSON.stringify(
      {
        receivedAt: new Date().toISOString(),
        userAgent,
        forwardedFor,
        referer,
        payload,
      },
      null,
      2,
    ),
  );

  return NextResponse.json({ ok: true });
}
