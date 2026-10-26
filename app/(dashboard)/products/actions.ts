"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKET } from "@/lib/storage";
import { normalizeExternalImageUrl, slugify } from "@/lib/utils";

export type FormState = { error?: string };

async function uploadProductImage(productId: string, file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const supabase = await createClient();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
  const path = `products/${productId}.${safeExt}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, buffer, {
    upsert: true,
    contentType: file.type || "image/jpeg",
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function createProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") || "").trim();
  let slug = String(formData.get("slug") || "").trim();
  const categoryId = String(formData.get("category_id") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const price = Number(formData.get("price") || 0);
  const unit = String(formData.get("unit") || "pcs").trim() || "pcs";
  const isActive = formData.get("is_active") === "on";
  const lowStockThreshold = Number(formData.get("low_stock_threshold"));

  if (!name) return { error: "Name is required" };
  if (!slug) slug = slugify(name);
  if (Number.isNaN(price) || price < 0) return { error: "Invalid price" };
  if (Number.isNaN(lowStockThreshold) || lowStockThreshold < 0) {
    return { error: "Invalid low stock threshold" };
  }

  const file = formData.get("image") as File | null;
  const imageUrlRaw = String(formData.get("image_url") || "").trim();
  if (imageUrlRaw && !(file && file.size > 0)) {
    if (!normalizeExternalImageUrl(imageUrlRaw)) {
      return { error: "Invalid image URL (use http or https)" };
    }
  }

  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      category_id: categoryId || null,
      description,
      price,
      unit,
      is_active: isActive,
      deleted_at: null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  const { error: invErr } = await supabase.from("inventory").insert({
    product_id: row.id,
    quantity: 0,
    low_stock_threshold: lowStockThreshold,
  });
  if (invErr) return { error: invErr.message };

  try {
    if (file && file.size > 0) {
      const url = await uploadProductImage(row.id, file);
      if (url) await supabase.from("products").update({ image_url: url }).eq("id", row.id);
    } else if (imageUrlRaw) {
      const external = normalizeExternalImageUrl(imageUrlRaw);
      if (!external) return { error: "Invalid image URL (use http or https)" };
      await supabase.from("products").update({ image_url: external }).eq("id", row.id);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Image upload failed" };
  }

  revalidatePath("/products");
  revalidatePath("/inventory");
  redirect("/products");
}

export async function updateProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  const productId = String(formData.get("product_id") || "").trim();
  if (!productId) return { error: "Missing product id" };

  const name = String(formData.get("name") || "").trim();
  let slug = String(formData.get("slug") || "").trim();
  const categoryId = String(formData.get("category_id") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const price = Number(formData.get("price") || 0);
  const unit = String(formData.get("unit") || "pcs").trim() || "pcs";
  const isActive = formData.get("is_active") === "on";
  const lowStockThreshold = Number(formData.get("low_stock_threshold"));

  if (!name) return { error: "Name is required" };
  if (!slug) slug = slugify(name);
  if (Number.isNaN(price) || price < 0) return { error: "Invalid price" };
  if (Number.isNaN(lowStockThreshold) || lowStockThreshold < 0) {
    return { error: "Invalid low stock threshold" };
  }

  const file = formData.get("image") as File | null;
  const imageUrlRaw = String(formData.get("image_url") || "").trim();
  if (imageUrlRaw && !(file && file.size > 0)) {
    if (!normalizeExternalImageUrl(imageUrlRaw)) {
      return { error: "Invalid image URL (use http or https)" };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name,
      slug,
      category_id: categoryId || null,
      description,
      price,
      unit,
      is_active: isActive,
    })
    .eq("id", productId);

  if (error) return { error: error.message };

  try {
    if (file && file.size > 0) {
      const url = await uploadProductImage(productId, file);
      if (url) await supabase.from("products").update({ image_url: url }).eq("id", productId);
    } else if (imageUrlRaw) {
      const external = normalizeExternalImageUrl(imageUrlRaw);
      if (!external) return { error: "Invalid image URL (use http or https)" };
      await supabase.from("products").update({ image_url: external }).eq("id", productId);
    } else {
      await supabase.from("products").update({ image_url: null }).eq("id", productId);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Image upload failed" };
  }

  const { data: invUpdated, error: invErr } = await supabase
    .from("inventory")
    .update({ low_stock_threshold: lowStockThreshold })
    .eq("product_id", productId)
    .select("id");

  if (invErr) return { error: invErr.message };

  if (!invUpdated?.length) {
    const { error: insErr } = await supabase.from("inventory").insert({
      product_id: productId,
      quantity: 0,
      low_stock_threshold: lowStockThreshold,
    });
    if (insErr) return { error: insErr.message };
  }

  revalidatePath("/products");
  revalidatePath("/inventory");
  redirect("/products");
}

export async function archiveProduct(productId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", productId);
  if (error) throw new Error(error.message);
  revalidatePath("/products");
}

export async function restoreProduct(productId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ deleted_at: null, is_active: true })
    .eq("id", productId);
  if (error) throw new Error(error.message);
  revalidatePath("/products");
}
