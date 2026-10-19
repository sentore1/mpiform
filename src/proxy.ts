import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin/* routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const isLoginPage = pathname.startsWith("/admin/login");

  // Build a mutable response so we can forward refreshed auth cookies
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() validates the JWT server-side
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Already logged in and hitting the login page → redirect to dashboard
  if (isLoginPage && user) {
    const next = request.nextUrl.searchParams.get("next") ?? "/admin/forms";
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = next;
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  // Not a protected route (login page itself) — let through
  if (isLoginPage) {
    return response;
  }

  // Not logged in → redirect to login
  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in but not an admin → 403
  const role = user.app_metadata?.role;
  if (role !== "admin") {
    return new NextResponse(
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Access Denied</title>
      <style>body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;
      justify-content:center;min-height:100vh;gap:12px;background:#f9fafb;color:#111}
      h1{font-size:1.5rem;font-weight:700}p{color:#6b7280;font-size:.9rem}
      a{color:#4f46e5;text-decoration:underline}</style></head>
      <body><h1>Access Denied</h1>
      <p>Your account does not have admin privileges.</p>
      <a href="/">← Back to forms</a></body></html>`,
      { status: 403, headers: { "Content-Type": "text/html" } }
    );
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
