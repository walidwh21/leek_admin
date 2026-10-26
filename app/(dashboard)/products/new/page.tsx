import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types/database";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id, name").order("name");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/products" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
          ← Back to products
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          New product
        </h1>
      </div>
      <ProductForm mode="create" categories={(categories ?? []) as Pick<Category, "id" | "name">[]} />
    </div>
  );
}
