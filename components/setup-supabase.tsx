/**
 * Shown when NEXT_PUBLIC_SUPABASE_* are not set so no route calls createClient() and throws.
 */
export function SetupSupabase() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-8 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-50">
      <h1 className="text-xl font-semibold tracking-tight">Configure Supabase</h1>
      <p className="mt-2 text-sm leading-relaxed opacity-90">
        Add your project URL and anon key so the admin app can connect. Copy{" "}
        <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900/80">
          .env.local.example
        </code>{" "}
        to{" "}
        <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900/80">
          .env.local
        </code>{" "}
        in the <code className="font-mono text-xs">leek_admin</code> folder, then fill:
      </p>
      <ul className="mt-4 list-inside list-disc space-y-1 text-sm">
        <li>
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code>
        </li>
        <li>
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
        </li>
      </ul>
      <p className="mt-4 text-sm text-amber-900/80 dark:text-amber-100/80">
        Get them from Supabase → Project Settings → API. After saving{" "}
        <code className="font-mono text-xs">.env.local</code>, restart{" "}
        <code className="font-mono text-xs">npm run dev</code> so Next.js picks up the variables.
      </p>
    </div>
  );
}
