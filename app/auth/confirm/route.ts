import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = requestUrl.searchParams.get("next") ?? "/admin";
  const redirectUrl = new URL(next, requestUrl.origin);
  const supabase = await createSupabaseServerClient();

  if (!supabase || !tokenHash || !type) {
    return NextResponse.redirect(new URL("/auth/login?message=Invalid confirmation link.", requestUrl.origin));
  }

  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    return NextResponse.redirect(new URL(`/auth/login?message=${encodeURIComponent(error.message)}`, requestUrl.origin));
  }

  return NextResponse.redirect(redirectUrl);
}
