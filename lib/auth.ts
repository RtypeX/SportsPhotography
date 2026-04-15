import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireAdminUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/auth/login?message=Add Supabase env vars first.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (!user.email_confirmed_at) {
    redirect(`/auth/login?message=Verify your email before entering the admin panel.&email=${encodeURIComponent(user.email ?? "")}`);
  }

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) {
    await supabase.auth.signOut();
    redirect("/auth/login?message=This account is not assigned as the admin user.");
  }

  return { supabase, user };
}
