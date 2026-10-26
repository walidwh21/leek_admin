import Link from "next/link";
import { CategoryForm } from "../category-form";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/categories" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
          ← Back to categories
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          New category
        </h1>
      </div>
      <CategoryForm mode="create" />
    </div>
  );
}
