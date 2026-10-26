"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKET } from "@/lib/storage";
import { normalizeExternalImageUrl, slugify } from "@/lib/utils";

export type FormState = { error?: string };

async function uploadImage(folder: string, id: string, file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const supabase = await createClient();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
  const path = `${folder}/${id}.${safeExt}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, buffer, {
    upsert: true,
    contentType: file.type || "image/jpeg",
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function createCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") || "").trim();
  let slug = String(formData.get("slug") || "").trim();
  if (!name) return { error: "Name is required" };
  if (!slug) slug = slugify(name);
  const position = Number(formData.get("position") || 0);
  const isActive = formData.get("is_active") === "on";

  const file = formData.get("image") as File | null;
  const imageUrlRaw = String(formData.get("image_url") || "").trim();
  if (imageUrlRaw && !(file && file.size > 0)) {
    if (!normalizeExternalImageUrl(imageUrlRaw)) {
      return { error: "Invalid image URL (use http or https)" };
    }
  }

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("categories")
    .insert({ name, slug, position, is_active: isActive })
    .select("id")
    .single();

  if (error) return { error: error.message };

  try {
    if (file && file.size > 0) {
      const url = await uploadImage("categories", row.id, file);
      if (url) await supabase.from("categories").update({ image_url: url }).eq("id", row.id);
    } else if (imageUrlRaw) {
      const external = normalizeExternalImageUrl(imageUrlRaw);
      if (!external) return { error: "Invalid image URL (use http or https)" };
      await supabase.from("categories").update({ image_url: external }).eq("id", row.id);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Image upload failed" };
  }

  revalidatePath("/categories");
  redirect("/categories");
}

export async function updateCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  const categoryId = String(formData.get("category_id") || "").trim();
  if (!categoryId) return { error: "Missing category id" };

  const name = String(formData.get("name") || "").trim();
  let slug = String(formData.get("slug") || "").trim();
  if (!name) return { error: "Name is required" };
  if (!slug) slug = slugify(name);
  const position = Number(formData.get("position") || 0);
  const isActive = formData.get("is_active") === "on";

  const file = formData.get("image") as File | null;
  const imageUrlRaw = String(formData.get("image_url") || "").trim();
  if (imageUrlRaw && !(file && file.size > 0)) {
    if (!normalizeExternalImageUrl(imageUrlRaw)) {
      return { error: "Invalid image URL (use http or https)" };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ name, slug, position, is_active: isActive })
    .eq("id", categoryId);

  if (error) return { error: error.message };

  try {
    if (file && file.size > 0) {
      const url = await uploadImage("categories", categoryId, file);
      if (url) await supabase.from("categories").update({ image_url: url }).eq("id", categoryId);
    } else if (imageUrlRaw) {
      const external = normalizeExternalImageUrl(imageUrlRaw);
      if (!external) return { error: "Invalid image URL (use http or https)" };
      await supabase.from("categories").update({ image_url: external }).eq("id", categoryId);
    } else {
      await supabase.from("categories").update({ image_url: null }).eq("id", categoryId);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Image upload failed" };
  }

  revalidatePath("/categories");
  redirect("/categories");
}
