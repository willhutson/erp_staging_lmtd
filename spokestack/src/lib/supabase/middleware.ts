import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { extractTenantFromHost } from "@/lib/tenant";

/**
 * Middleware for multi-tenant domain handling + Supabase auth
 *
 * Domain Resolution:
 * 1. Subdomains: lmtd.spokestack.io → tenant "lmtd"
 * 2. Custom domains: app.teamlmtd.com → lookup in ClientInstance.customDomain
 * 3. Default: spokestack.io → default SpokeStack tenant
 *
 * Headers set for downstream:
 * - x-tenant-type: "subdomain" | "custom" | "default"
 * - x-tenant-identifier: the subdomain or custom domain
 * - x-tenant-host: original host header
 */
export async function updateSession(request: NextRequest) {
  // Extract tenant info from hostname
  const host = request.headers.get("host") || "localhost";
  const tenantInfo = extractTenantFromHost(host);

  // Clone the request headers to add tenant info
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-type", tenantInfo.type);
  requestHeaders.set("x-tenant-identifier", tenantInfo.identifier);
  requestHeaders.set("x-tenant-host", host);

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set tenant headers on response for client access
  supabaseResponse.headers.set("x-tenant-type", tenantInfo.type);
  supabaseResponse.headers.set("x-tenant-identifier", tenantInfo.identifier);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip auth check if env vars are missing (build time)
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
        // Re-add tenant headers after response recreation
        supabaseResponse.headers.set("x-tenant-type", tenantInfo.type);
        supabaseResponse.headers.set("x-tenant-identifier", tenantInfo.identifier);
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup");
  const isPublicRoute =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/api/webhooks");
  const isProtectedRoute = !isAuthRoute && !isPublicRoute;

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
