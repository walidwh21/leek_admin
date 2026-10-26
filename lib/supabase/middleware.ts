import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAuthCookieOptions } from "@/lib/supabase/auth-storage-key";

const PUBLIC_PREFIXES = ["/login", "/auth"];

function isPublicPath(pathname: string) {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anon, {
    cookieOptions: getSupabaseAuthCookieOptions(),
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (isPublicPath(pathname)) {
    if (user) {
      const { data: isAdmin, error } = await supabase.rpc("is_admin");
      if (!error && isAdmin === true) {
        const dest = new URL("/", request.url);
        return NextResponse.redirect(dest);
      }
      await supabase.auth.signOut();
    }
    return supabaseResponse;
  }

  if (!user) {
    const dest = new URL("/login", request.url);
    return NextResponse.redirect(dest);
  }

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) {
    await supabase.auth.signOut();
    const dest = new URL("/login?error=unauthorized", request.url);
    return NextResponse.redirect(dest);
  }

  return supabaseResponse;
}
