import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types/database";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("position", { ascending: true });

  if (error) {
    return (
      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
        {error.message}
      </p>
    );
  }

  const rows = (categories ?? []) as Category[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Categories
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manage catalogue categories.</p>
        </div>
        <Link
          href="/categories/new"
          className="inline-flex justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          New category
        </Link>
      </div>

      <div className="hidden md:block">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-3">
                    <Thumb url={c.image_url} name={c.name} />
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">{c.name}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{c.slug}</td>
                  <td className="px-4 py-3 tabular-nums">{c.position}</td>
                  <td className="px-4 py-3">{c.is_active ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/categories/${c.id}/edit`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:hidden">
        {rows.map((c) => (
          <div
            key={c.id}
            className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <Thumb url={c.image_url} name={c.name} size={64} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-zinc-900 dark:text-zinc-50">{c.name}</p>
              <p className="truncate text-xs text-zinc-500">{c.slug}</p>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Pos {c.position} · {c.is_active ? "Active" : "Inactive"}
              </p>
              <Link href={`/categories/${c.id}/edit`} className="mt-2 inline-block text-sm text-emerald-700 dark:text-emerald-400">
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Thumb({ url, name, size = 40 }: { url: string | null; name: string; size?: number }) {
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
