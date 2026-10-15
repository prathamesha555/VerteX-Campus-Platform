import { NextResponse } from "next/server";

import { createClient } from "../../../lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");

  const requestedNext =
    requestUrl.searchParams.get("next") ?? "/";

  // Only permit local paths to prevent open redirects.
  const next =
    requestedNext.startsWith("/") &&
    !requestedNext.startsWith("//")
      ? requestedNext
      : "/";

  if (code) {
    const supabase = await createClient();

    const { error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(
        new URL(next, requestUrl.origin)
      );
    }
  }

  // If verification fails, return the user to login.
  return NextResponse.redirect(
    new URL("/login?error=confirmation", requestUrl.origin)
  );
}