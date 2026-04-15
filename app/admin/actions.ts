"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth";

export async function updatePhotoAction(formData: FormData) {
  const { supabase } = await requireAdminUser();
  const collectionSlug = String(formData.get("collectionSlug") ?? "");
  const filename = String(formData.get("filename") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  const featured = formData.get("featured") === "on";
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  const { error } = await supabase.from("collection_photos").upsert(
    {
      collection_slug: collectionSlug,
      filename,
      title,
      caption,
      featured,
      sort_order: sortOrder,
    },
    {
      onConflict: "collection_slug,filename",
    },
  );

  if (error) {
    redirect(`/admin?collection=${collectionSlug}&message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath(`/collections/${collectionSlug}`);
  revalidatePath("/admin");
  redirect(`/admin?collection=${collectionSlug}&message=Photo saved.`);
}
