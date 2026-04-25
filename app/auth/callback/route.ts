import { NextResponse } from "next/server";

import { OAUTH_REDIRECT_COOKIE, parseOAuthRedirectState, sanitizeRedirect } from "@/src/lib/auth-redirect";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const rawState = requestUrl.searchParams.get("state");
  const cookieHeader = request.headers.get("cookie") ?? "";
  const fallbackRedirect =
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${OAUTH_REDIRECT_COOKIE}=`))
      ?.slice(OAUTH_REDIRECT_COOKIE.length + 1) ?? null;
  const parsedState = parseOAuthRedirectState(rawState);
  const safeNext = sanitizeRedirect(next || parsedState?.redirectTo || (fallbackRedirect ? decodeURIComponent(fallbackRedirect) : null));

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const response = NextResponse.redirect(new URL(safeNext || "/", requestUrl.origin));
  response.cookies.set(OAUTH_REDIRECT_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });
  return response;
}
