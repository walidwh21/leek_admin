import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { InventoryRow, Product } from "@/lib/types/database";
import { InventoryRowForm } from "./inventory-row-form";

type InvRow = InventoryRow & {
  products: Pick<Product, "name" | "slug" | "unit" | "deleted_at"> | null;
};

type Props = {
  searchParams: Promise<{ low?: string }>;
};

export default async function InventoryPage({ searchParams }: Props) {
  const sp = await searchParams;
  const lowOnly = sp.low === "1" || sp.low === "true";

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory")
    .select("*, products(name, slug, unit, deleted_at)")
    .order("updated_at", { ascending: false });

  if (error) {
    return (
      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
        {error.message}
      </p>
    );
  }

  let rows = (data ?? []) as InvRow[];
  if (lowOnly) {
    rows = rows.filter((r) => r.quantity <= r.low_stock_threshold);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Inventory</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Stock levels and reorder thresholds.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterLink active={!lowOnly} href="/inventory">
            All
          </FilterLink>
          <FilterLink active={lowOnly} href="/inventory?low=1">
            Low stock
          </FilterLink>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Low threshold</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Adjust</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const low = r.quantity <= r.low_stock_threshold;
                const name = r.products?.name ?? "Unknown";
                return (
                  <tr key={r.id} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="px-4 py-3">
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">{name}</span>
                      {r.products?.deleted_at ? (
                        <span className="ml-2 text-xs text-amber-700 dark:text-amber-400">(archived)</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      <span className={low ? "font-semibold text-amber-700 dark:text-amber-400" : ""}>
                        {r.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{r.low_stock_threshold}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {new Date(r.updated_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <InventoryRowForm
                        inventoryId={r.id}
                        quantity={r.quantity}
                        lowStockThreshold={r.low_stock_threshold}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:hidden">
        {rows.map((r) => {
          const low = r.quantity <= r.low_stock_threshold;
          const name = r.products?.name ?? "Unknown";
          return (
            <div
              key={r.id}
              className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{name}</p>
                  <p className="text-xs text-zinc-500">{r.products?.unit ?? ""}</p>
                </div>
                {low ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-100">
                    Low
                  </span>
                ) : null}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-zinc-500">Quantity</p>
                  <p className="font-semibold tabular-nums">{r.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Threshold</p>
                  <p className="font-semibold tabular-nums">{r.low_stock_threshold}</p>
                </div>
              </div>
              <div className="mt-4">
                <InventoryRowForm
                  inventoryId={r.id}
                  quantity={r.quantity}
                  lowStockThreshold={r.low_stock_threshold}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white"
          : "rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      }
    >
      {children}
    </Link>
  );
}
