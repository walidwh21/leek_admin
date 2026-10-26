"use client";

import { useFormState } from "react-dom";
import type { Category, Product } from "@/lib/types/database";
import type { FormState } from "./actions";
import { createProduct, updateProduct } from "./actions";

type Props = {
  mode: "create" | "edit";
  product?: Product;
  categories: Pick<Category, "id" | "name">[];
  /** Current threshold from inventory (edit); defaults to 10 on create */
  lowStockThreshold?: number | null;
};

const initial: FormState = {};

export function ProductForm({ mode, product, categories, lowStockThreshold }: Props) {
  const [state, formAction] = useFormState(
    mode === "create" ? createProduct : updateProduct,
    initial,
  );

  return (
    <form action={formAction} encType="multipart/form-data" className="mx-auto max-w-xl space-y-6">
      {mode === "edit" && product ? <input type="hidden" name="product_id" value={product.id} /> : null}
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
          {state.error}
        </p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Name
        <input
          name="name"
          required
          defaultValue={product?.name}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Slug
        <input
          name="slug"
          defaultValue={product?.slug}
          placeholder="auto from name if empty"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Category
        <select
          name="category_id"
          defaultValue={product?.category_id ?? ""}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <option value="">— None —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Description
        <textarea
          name="description"
          rows={3}
          defaultValue={product?.description ?? ""}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Price
          <input
            name="price"
            type="number"
            step="0.01"
            min={0}
            required
            defaultValue={product?.price ?? ""}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Unit
          <input
            name="unit"
            defaultValue={product?.unit ?? "pcs"}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Low stock threshold
        <input
          name="low_stock_threshold"
          type="number"
          min={0}
          step={1}
          required
          defaultValue={
            mode === "edit"
              ? (lowStockThreshold != null && !Number.isNaN(lowStockThreshold) ? lowStockThreshold : 10)
              : 10
          }
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <span className="text-xs font-normal text-zinc-500">
          {mode === "create"
            ? "Used for the new inventory row when the product is created."
            : "Updates every inventory row for this product (same threshold for all stock lines)."}
        </span>
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
        <input name="is_active" type="checkbox" defaultChecked={product?.is_active ?? true} />
        Active
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Image file (optional)
        <input name="image" type="file" accept="image/*" className="text-sm" />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Image URL (optional)
        <input
          name="image_url"
          type="url"
          inputMode="url"
          autoComplete="off"
          placeholder="https://example.com/image.jpg"
          defaultValue={product?.image_url ?? ""}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <span className="text-xs font-normal text-zinc-500">
          Paste a direct link to an image on the web. If you also choose a file, the file is used.
        </span>
      </label>

      <button
        type="submit"
        className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
      >
        {mode === "create" ? "Create product" : "Save changes"}
      </button>
    </form>
  );
}
