import { createServerClient } from "@supabase/ssr";

import {
  NextResponse,
  type NextRequest,
} from "next/server";

export async function updateSession(
  request: NextRequest
) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Supabase configuration is missing. Check .env.local."
    );
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(name, value);
            }
          );

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              supabaseResponse.cookies.set(
                name,
                value,
                options
              );
            }
          );

          Object.entries(headers).forEach(
            ([key, value]) => {
              supabaseResponse.headers.set(
                key,
                value
              );
            }
          );
        },
      },
    }
  );

  // Verify the user's authentication claims.
  const { data, error } =
    await supabase.auth.getClaims();

  const isAuthenticated =
    !error && Boolean(data?.claims?.sub);

  const pathname = request.nextUrl.pathname;

  // Visitors can access these routes without signing in.
  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api");

  // Redirect unauthenticated visitors to login.
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = "/login";

    loginUrl.search = "";

    const redirectResponse =
      NextResponse.redirect(loginUrl);

    // Preserve any cookies updated during session handling.
    supabaseResponse.cookies.getAll().forEach(
      (cookie) => {
        redirectResponse.cookies.set(cookie);
      }
    );

    return redirectResponse;
  }

  return supabaseResponse;
}