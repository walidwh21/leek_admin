import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function buildProductsListHref(q: string, categoryId: string) {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (categoryId) p.set("category", categoryId);
  const s = p.toString();
  return s ? `/products?${s}` : "/products";
}

type Category = { id: string; name: string };

export function ProductsSearchForm({ q, categoryId }: { q: string; categoryId: string }) {
  return (
    <form action="/products" method="get" className="flex w-full max-w-md gap-2 sm:max-w-sm">
      {categoryId ? <input type="hidden" name="category" value={categoryId} /> : null}
      <input
        name="q"
        type="search"
        defaultValue={q}
        placeholder="Search by name…"
        className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        aria-label="Search products"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-zinc-200 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
      >
        Search
      </button>
    </form>
  );
}

export function ProductsCategoryBar({
  categories,
  q,
  categoryId,
}: {
  categories: Category[];
  q: string;
  categoryId: string;
}) {
  const pill = (active: boolean) =>
    cn(
      "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition",
      active
        ? "bg-emerald-600 text-white dark:bg-emerald-600"
        : "border border-zinc-200 bg-white text-zinc-700 hover:border-emerald-300 hover:bg-emerald-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-emerald-700 dark:hover:bg-zinc-700",
    );

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Category
      </span>
      <div className="-mx-1 flex flex-wrap gap-2 overflow-x-auto px-1 pb-1 sm:pb-0">
        <Link href={buildProductsListHref(q, "")} className={pill(!categoryId)}>
          All
        </Link>
        {categories.map((c) => (
          <Link key={c.id} href={buildProductsListHref(q, c.id)} className={pill(categoryId === c.id)}>
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
