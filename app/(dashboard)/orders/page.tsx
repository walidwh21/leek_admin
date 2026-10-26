import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Order, Profile } from "@/lib/types/database";
import { formatDate, formatMoney } from "@/lib/utils";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
        {error.message}
      </p>
    );
  }

  const list = (orders ?? []) as Order[];
  const userIds = [...new Set(list.map((o) => o.user_id))];

  let pmap = new Map<string, Profile>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, phone").in("id", userIds);
    pmap = new Map((profiles ?? []).map((p) => [p.id, p as Profile]));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Orders</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Incoming queue and history.</p>
      </div>

      <div className="hidden md:block">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {list.map((o) => {
                const p = pmap.get(o.user_id);
                return (
                  <tr key={o.id} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">
                        {p?.full_name ?? "—"}
                      </span>
                      <div className="text-xs text-zinc-500">{p?.phone ?? o.user_id.slice(0, 8)}…</div>
                    </td>
                    <td className="px-4 py-3 capitalize">{o.status.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 tabular-nums font-medium">{formatMoney(Number(o.total_amount))}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/orders/${o.id}`}
                        className="text-emerald-700 hover:underline dark:text-emerald-400"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:hidden">
        {list.map((o) => {
          const p = pmap.get(o.user_id);
          return (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              className="block rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-800"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {p?.full_name ?? "Customer"}
                  </p>
                  <p className="text-xs text-zinc-500">{formatDate(o.created_at)}</p>
                </div>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium capitalize text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
                  {o.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="mt-3 text-lg font-semibold tabular-nums">{formatMoney(Number(o.total_amount))}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
