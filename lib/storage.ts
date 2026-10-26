/** Default bucket for category/product images — create in Supabase + policies. */
export const STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "product-images";
