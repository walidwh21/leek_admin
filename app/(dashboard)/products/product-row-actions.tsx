"use client";

import { useTransition } from "react";
import { archiveProduct, restoreProduct } from "./actions";

export function ProductRowActions({
  productId,
  isArchived,
}: {
  productId: string;
  isArchived: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <>
      {isArchived ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => void restoreProduct(productId))}
          className="text-sm text-emerald-700 hover:underline disabled:opacity-50 dark:text-emerald-400"
        >
          Restore
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirm("Archive this product?")) return;
            startTransition(() => void archiveProduct(productId));
          }}
          className="text-sm text-amber-700 hover:underline disabled:opacity-50 dark:text-amber-400"
        >
          Archive
        </button>
      )}
    </>
  );
}
