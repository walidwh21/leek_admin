"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAuthCookieOptions } from "@/lib/supabase/auth-storage-key";

/**
 * Browser Supabase client (uses anon key + user session; respects RLS).
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createBrowserClient(url, anon, {
    cookieOptions: getSupabaseAuthCookieOptions(),
  });
}
