"use client";

import { useFormState } from "react-dom";
import type { Category } from "@/lib/types/database";
import type { FormState } from "./actions";
import { createCategory, updateCategory } from "./actions";

type Props = {
  mode: "create" | "edit";
  category?: Category;
};

const initial: FormState = {};

export function CategoryForm({ mode, category }: Props) {
  const [state, formAction] = useFormState(
    mode === "create" ? createCategory : updateCategory,
    initial,
  );

  return (
    <form action={formAction} encType="multipart/form-data" className="mx-auto max-w-xl space-y-6">
      {mode === "edit" && category ? (
        <input type="hidden" name="category_id" value={category.id} />
      ) : null}
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
          defaultValue={category?.name}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Slug
        <input
          name="slug"
          defaultValue={category?.slug}
          placeholder="auto from name if empty"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Position
        <input
          name="position"
          type="number"
          defaultValue={category?.position ?? 0}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
        <input name="is_active" type="checkbox" defaultChecked={category?.is_active ?? true} />
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
          defaultValue={category?.image_url ?? ""}
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
        {mode === "create" ? "Create category" : "Save changes"}
      </button>
    </form>
  );
}
