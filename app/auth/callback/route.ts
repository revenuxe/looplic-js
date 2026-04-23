import { NextResponse } from "next/server";

import { createClient } from "@/src/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const cookieRedirect = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("looplic-auth-redirect="))
    ?.split("=")[1];
  const decodedCookieRedirect = cookieRedirect ? decodeURIComponent(cookieRedirect) : null;
  const safeNext = (next && next.startsWith("/") ? next : decodedCookieRedirect && decodedCookieRedirect.startsWith("/") ? decodedCookieRedirect : "/");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const response = NextResponse.redirect(new URL(safeNext, requestUrl.origin));
  response.cookies.set("looplic-auth-redirect", "", { path: "/", maxAge: 0 });
  return response;
}
