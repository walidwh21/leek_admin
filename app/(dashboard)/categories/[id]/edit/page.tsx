import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types/database";
import { CategoryForm } from "../../category-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").eq("id", id).single();

  if (error || !data) notFound();
  const category = data as Category;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/categories" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
          ← Back to categories
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Edit category
        </h1>
      </div>
      <CategoryForm mode="edit" category={category} />
    </div>
  );
}
