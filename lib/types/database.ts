/** Minimal types aligned with LEEK Supabase schema (enums + row shapes). */

export type OrderStatus =
  | "pending"
  | "picking"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "pending_cod"
  | "pending_wire"
  | "paid"
  | "failed";

export type PaymentMethod = "cod" | "card" | "wire";

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  price: number;
  unit: string;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InventoryRow = {
  id: string;
  product_id: string;
  quantity: number;
  low_stock_threshold: number;
  updated_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  address_id: string | null;
  status: OrderStatus;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  subtotal: number;
  created_at: string;
};

export type Payment = {
  id: string;
  order_id: string;
  user_id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  provider_ref: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type OrderStatusHistory = {
  id: string;
  order_id: string;
  old_status: OrderStatus | null;
  new_status: OrderStatus;
  changed_by: string | null;
  note: string | null;
  created_at: string;
};
