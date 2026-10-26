import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/utils";
import type { Product } from "@/lib/types/database";
import { ProductRowActions } from "./product-row-actions";
import { ProductsCategoryBar, ProductsSearchForm } from "./products-toolbar";

type ProductWithCategory = Product & {
  categories: { name: string; slug: string } | null;
};

type Props = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const categoryId = typeof sp.category === "string" ? sp.category.trim() : "";

  const supabase = await createClient();

  const { data: categoriesData } = await supabase.from("categories").select("id, name").order("name");
  const categories = (categoriesData ?? []) as { id: string; name: string }[];

  let query = supabase
    .from("products")
    .select("*, categories(name, slug)")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }
  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;

  if (error) {
    return (
      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
        {error.message}
      </p>
    );
  }

  const rows = (data ?? []) as ProductWithCategory[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Products</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Manage catalogue items. Archived = soft-deleted.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end lg:max-w-2xl lg:shrink-0">
          <ProductsSearchForm q={q} categoryId={categoryId} />
          <Link
            href="/products/new"
            className="inline-flex justify-center whitespace-nowrap rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 sm:shrink-0"
          >
            New product
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
        <ProductsCategoryBar categories={categories} q={q} categoryId={categoryId} />
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          {q || categoryId ? (
            <>
              No products match these filters.{" "}
              <Link href="/products" className="font-medium text-emerald-700 underline dark:text-emerald-400">
                Clear filters
              </Link>
            </>
          ) : (
            <>
              No products yet.{" "}
              <Link href="/products/new" className="font-medium text-emerald-700 underline dark:text-emerald-400">
                Create one
              </Link>{" "}
              to get started.
            </>
          )}
        </p>
      ) : null}

      {rows.length > 0 ? (
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-3">
                    <ProductThumb url={p.image_url} name={p.name} />
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">{p.name}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {p.categories?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{formatMoney(Number(p.price))}</td>
                  <td className="px-4 py-3">
                    <Status deletedAt={p.deleted_at} active={p.is_active} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/products/${p.id}/edit`}
                        className="text-emerald-700 hover:underline dark:text-emerald-400"
                      >
                        Edit
                      </Link>
                      <ProductRowActions productId={p.id} isArchived={!!p.deleted_at} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      ) : null}

      {rows.length > 0 ? (
      <div className="grid gap-4 md:hidden">
        {rows.map((p) => (
          <div
            key={p.id}
            className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <ProductThumb url={p.image_url} name={p.name} size={80} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-zinc-900 dark:text-zinc-50">{p.name}</p>
              <p className="text-xs text-zinc-500">{p.categories?.name ?? "No category"}</p>
              <p className="mt-1 text-sm font-semibold tabular-nums">{formatMoney(Number(p.price))}</p>
              <Status deletedAt={p.deleted_at} active={p.is_active} />
              <div className="mt-2 flex flex-wrap gap-3">
                <Link href={`/products/${p.id}/edit`} className="text-sm text-emerald-700 dark:text-emerald-400">
                  Edit
                </Link>
                <ProductRowActions productId={p.id} isArchived={!!p.deleted_at} />
              </div>
            </div>
          </div>
        ))}
      </div>
      ) : null}
    </div>
  );
}

function ProductThumb({ url, name, size = 40 }: { url: string | null; name: string; size?: number }) {
  if (!url) {
    return (
      <div
        className="flex items-center justify-center rounded bg-zinc-100 text-xs text-zinc-400 dark:bg-zinc-800"
        style={{ width: size, height: size }}
      >
        —
      </div>
    );
  }
  return (
    <Image
      src={url}
      alt={name}
      width={size}
      height={size}
      className="rounded object-cover"
      style={{ width: size, height: size }}
      unoptimized
    />
  );
}

function Status({ deletedAt, active }: { deletedAt: string | null; active: boolean }) {
  if (deletedAt) {
    return <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Archived</span>;
  }
  return (
    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{active ? "Active" : "Inactive"}</span>
  );
}
