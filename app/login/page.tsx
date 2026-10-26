import { SetupSupabase } from "@/components/setup-supabase";
import { hasSupabaseEnv } from "@/lib/env";
import { LoginForm } from "./login-form";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const banner =
    sp.error === "unauthorized"
      ? "Your account is not authorized as an admin."
      : sp.error === "auth"
        ? "Could not complete sign-in. Try again."
        : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4 py-12 dark:bg-zinc-950">
      {!hasSupabaseEnv() ? (
        <SetupSupabase />
      ) : (
        <>
          {banner ? (
            <p className="mb-6 max-w-md rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              {banner}
            </p>
          ) : null}
          <LoginForm redirectTo="/" />
        </>
      )}
    </div>
  );
}
