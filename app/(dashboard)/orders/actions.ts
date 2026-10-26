"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types/database";

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string | null) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_order_status", {
    p_order_id: orderId,
    p_new_status: newStatus,
    p_note: note ?? null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
}
