import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem, OrderStatusHistory, Payment, Profile } from "@/lib/types/database";
import { formatDate, formatMoney } from "@/lib/utils";
import { OrderStatusForm } from "../order-status-form";

type Props = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order, error: orderErr } = await supabase.from("orders").select("*").eq("id", id).single();

  if (orderErr || !order) notFound();
  const o = order as Order;

  const [{ data: items }, { data: payment }, { data: history }, { data: profile }] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", id).order("created_at"),
    supabase.from("payments").select("*").eq("order_id", id).maybeSingle(),
    supabase.from("order_status_history").select("*").eq("order_id", id).order("created_at", { ascending: false }),
    supabase.from("profiles").select("*").eq("id", o.user_id).maybeSingle(),
  ]);

  const lineItems = (items ?? []) as OrderItem[];
  const pay = payment as Payment | null;
  const hist = (history ?? []) as OrderStatusHistory[];
  const prof = profile as Profile | null;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/orders" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
          ← Back to orders
        </Link>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Order {o.id.slice(0, 8)}…
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Placed {formatDate(o.created_at)} ·{" "}
              <span className="capitalize">{o.status.replace(/_/g, " ")}</span>
            </p>
          </div>
          <p className="text-xl font-semibold tabular-nums">{formatMoney(Number(o.total_amount))}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Customer</h2>
            <dl className="mt-3 grid gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Name</dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-50">{prof?.full_name ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Phone</dt>
                <dd className="text-zinc-900 dark:text-zinc-50">{prof?.phone ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">User ID</dt>
                <dd className="break-all text-xs text-zinc-600 dark:text-zinc-400">{o.user_id}</dd>
              </div>
            </dl>
            {o.notes ? (
              <div className="mt-4 rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-950">
                <p className="text-xs font-medium uppercase text-zinc-500">Notes</p>
                <p className="mt-1 text-zinc-800 dark:text-zinc-200">{o.notes}</p>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Line items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-950">
                  <tr>
                    <th className="px-5 py-2">Product</th>
                    <th className="px-5 py-2">Qty</th>
                    <th className="px-5 py-2">Unit</th>
                    <th className="px-5 py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((li) => (
                    <tr key={li.id} className="border-t border-zinc-100 dark:border-zinc-800">
                      <td className="px-5 py-3">
                        <span className="font-medium text-zinc-900 dark:text-zinc-50">
                          {li.product_name_snapshot}
                        </span>
                        {li.product_id ? (
                          <div className="text-xs text-zinc-500">{li.product_id.slice(0, 8)}…</div>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 tabular-nums">{li.quantity}</td>
                      <td className="px-5 py-3 tabular-nums">{formatMoney(Number(li.unit_price_snapshot))}</td>
                      <td className="px-5 py-3 tabular-nums font-medium">
                        {formatMoney(Number(li.subtotal))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Status history</h2>
            <ul className="mt-4 space-y-3">
              {hist.map((h) => (
                <li
                  key={h.id}
                  className="flex flex-col gap-1 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium capitalize text-zinc-900 dark:text-zinc-50">
                      {(h.old_status ?? "—").replace(/_/g, " ")} → {h.new_status.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-zinc-500">{formatDate(h.created_at)}</span>
                  </div>
                  {h.note ? <p className="text-zinc-600 dark:text-zinc-400">{h.note}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Payment</h2>
            {pay ? (
              <dl className="mt-3 grid gap-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">Method</dt>
                  <dd className="font-medium uppercase text-zinc-900 dark:text-zinc-50">{pay.method}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">Status</dt>
                  <dd className="font-medium text-zinc-900 dark:text-zinc-50">{pay.status.replace(/_/g, " ")}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">Amount</dt>
                  <dd className="tabular-nums font-semibold">{formatMoney(Number(pay.amount))}</dd>
                </div>
                {pay.provider_ref ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-zinc-500">Ref</dt>
                    <dd className="break-all text-xs">{pay.provider_ref}</dd>
                  </div>
                ) : null}
              </dl>
            ) : (
              <p className="mt-2 text-sm text-zinc-500">No payment row found.</p>
            )}
          </section>

          <OrderStatusForm orderId={o.id} currentStatus={o.status} />
        </div>
      </div>
    </div>
  );
}
