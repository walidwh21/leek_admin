"use client";

import { useFormState } from "react-dom";
import type { InventoryFormState } from "./actions";
import { updateInventoryRow } from "./actions";

const initial: InventoryFormState = {};

export function InventoryRowForm({
  inventoryId,
  quantity,
  lowStockThreshold,
}: {
  inventoryId: string;
  quantity: number;
  lowStockThreshold: number;
}) {
  const [state, formAction] = useFormState(updateInventoryRow, initial);

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
      <input type="hidden" name="inventory_id" value={inventoryId} />
      <label className="flex flex-col text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Qty
        <input
          name="quantity"
          type="number"
          min={0}
          required
          defaultValue={quantity}
          className="mt-1 w-24 rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>
      <label className="flex flex-col text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Low
        <input
          name="low_stock_threshold"
          type="number"
          min={0}
          required
          defaultValue={lowStockThreshold}
          className="mt-1 w-24 rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>
      <button
        type="submit"
        className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-700"
      >
        Save
      </button>
      {state.error ? (
        <span className="text-xs text-red-600 dark:text-red-400">{state.error}</span>
      ) : null}
      {state.success ? (
        <span className="text-xs text-emerald-600 dark:text-emerald-400">Saved</span>
      ) : null}
    </form>
  );
}
