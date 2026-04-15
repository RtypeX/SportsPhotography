"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/auth/login?message=Supabase env vars are missing.");
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/auth/login?message=${encodeURIComponent(error.message)}&email=${encodeURIComponent(email)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email_confirmed_at) {
    redirect(`/auth/login?message=${encodeURIComponent("Verify the admin email before signing in.")}&email=${encodeURIComponent(email)}`);
  }

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) {
    await supabase.auth.signOut();
    redirect("/auth/login?message=This account is not configured as the admin user.");
  }

  redirect("/admin");
}

export async function resendVerificationAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const supabase = await createSupabaseServerClient();
  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? "http://localhost:3000";

  if (!supabase) {
    redirect("/auth/login?message=Supabase env vars are missing.");
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=/admin`,
    },
  });

  if (error) {
    redirect(`/auth/login?message=${encodeURIComponent(error.message)}&email=${encodeURIComponent(email)}`);
  }

  redirect(`/auth/login?message=${encodeURIComponent("Verification email sent.")}&email=${encodeURIComponent(email)}`);
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/auth/login");
}
