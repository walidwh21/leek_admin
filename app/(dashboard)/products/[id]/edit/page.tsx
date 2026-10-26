import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/lib/types/database";
import { ProductForm } from "../../product-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: product, error }, { data: categories }, { data: invRow }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("inventory").select("low_stock_threshold").eq("product_id", id).limit(1).maybeSingle(),
  ]);

  if (error || !product) notFound();

  const lowStockThreshold =
    invRow != null && typeof (invRow as { low_stock_threshold?: number }).low_stock_threshold === "number"
      ? (invRow as { low_stock_threshold: number }).low_stock_threshold
      : null;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/products" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
          ← Back to products
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Edit product
        </h1>
      </div>
      <ProductForm
        mode="edit"
        product={product as Product}
        categories={(categories ?? []) as Pick<Category, "id" | "name">[]}
        lowStockThreshold={lowStockThreshold}
      />
    </div>
  );
}
