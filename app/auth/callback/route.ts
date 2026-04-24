import { NextResponse } from "next/server";

import { parseOAuthRedirectState, sanitizeRedirect } from "@/src/lib/auth-redirect";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const rawState = requestUrl.searchParams.get("state");
  const parsedState = parseOAuthRedirectState(rawState);
  const safeNext = sanitizeRedirect(next || parsedState?.redirectTo);

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(safeNext || "/", requestUrl.origin));
}
