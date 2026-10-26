"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type InventoryFormState = { error?: string; success?: boolean };

export async function updateInventoryRow(
  _prev: InventoryFormState,
  formData: FormData,
): Promise<InventoryFormState> {
  const id = String(formData.get("inventory_id") || "").trim();
  const quantity = Number(formData.get("quantity"));
  const low = Number(formData.get("low_stock_threshold"));

  if (!id) return { error: "Missing inventory row" };
  if (Number.isNaN(quantity) || quantity < 0) return { error: "Invalid quantity" };
  if (Number.isNaN(low) || low < 0) return { error: "Invalid low stock threshold" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("inventory")
    .update({ quantity, low_stock_threshold: low })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/inventory");
  return { success: true as const };
}
