"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type BookingRequestState = {
  status: "idle" | "success" | "error";
  message: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function submitBookingRequest(
  _previousState: BookingRequestState,
  formData: FormData,
): Promise<BookingRequestState> {
  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim().toLowerCase();
  const teamName = String(formData.get("teamName") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "").trim();
  const coverageType = String(formData.get("coverageType") ?? "").trim();
  const collectionSlug = String(formData.get("collectionSlug") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!contactName || !contactEmail || !coverageType || !message) {
    return {
      status: "error",
      message: "Add your name, email, coverage type, and a few details before sending.",
    };
  }

  if (!isValidEmail(contactEmail)) {
    return {
      status: "error",
      message: "Enter a valid email address so Dustin can reply.",
    };
  }

  if (message.length < 20) {
    return {
      status: "error",
      message: "Add a little more detail so the request is easy to quote.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      status: "error",
      message: "Supabase environment variables are missing, so requests cannot be saved yet.",
    };
  }

  const { error } = await supabase.from("booking_requests").insert({
    collection_slug: collectionSlug || null,
    contact_name: contactName,
    contact_email: contactEmail,
    team_name: teamName || null,
    event_date: eventDate || null,
    coverage_type: coverageType,
    message,
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  revalidatePath("/admin");

  return {
    status: "success",
    message: "Request sent. Dustin should have the details in the admin panel now.",
  };
}
