/**
 * Distinct auth storage keys per app so admin and store on the same host
 * (e.g. localhost) do not share Supabase session cookies.
 */
export function getSupabaseAuthStorageKey(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
  }
  let hostname: string;
  try {
    hostname = new URL(raw).hostname;
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid URL");
  }
  const projectRef = hostname.split(".")[0] || "supabase";
  return `sb-${projectRef}-auth-token-leek-admin`;
}

export function getSupabaseAuthCookieOptions() {
  return { name: getSupabaseAuthStorageKey() };
}
