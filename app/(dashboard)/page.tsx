import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/utils";

export default async function DashboardHomePage() {
  const supabase = await createClient();

  const [productsRes, invRes, ordersRes] = await Promise.all([
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase.from("inventory").select("quantity, low_stock_threshold"),
    supabase.from("orders").select("status, total_amount"),
  ]);

  const productCount = productsRes.count ?? 0;
  const inv = invRes.data ?? [];
  const lowStock = inv.filter((r) => r.quantity <= r.low_stock_threshold).length;
  const orders = ordersRes.data ?? [];
  const byStatus = orders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const revenue = orders.reduce((s, o) => s + Number(o.total_amount), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Overview of catalogue, stock, and orders.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active products" value={String(productCount)} href="/products" />
        <StatCard title="Low stock SKUs" value={String(lowStock)} href="/inventory?low=1" />
        <StatCard title="Orders (total)" value={String(orders.length)} href="/orders" />
        <StatCard title="Revenue (all orders)" value={formatMoney(revenue)} href="/orders" />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Orders by status</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {["pending", "picking", "out_for_delivery", "delivered", "cancelled"].map((s) => (
            <li
              key={s}
              className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <span className="capitalize text-zinc-700 dark:text-zinc-300">{s.replace(/_/g, " ")}</span>
              <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                {byStatus[s] ?? 0}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/categories/new"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          New category
        </Link>
        <Link
          href="/products/new"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          New product
        </Link>
      </div>
    </div>
  );
}

function StatCard({ title, value, href }: { title: string; value: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-800"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{value}</p>
    </Link>
  );
}
