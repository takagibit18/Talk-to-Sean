import { NextRequest, NextResponse } from "next/server";
import { localeFromAcceptLanguage, parseLocale } from "@/lib/locale";

export function middleware(request: NextRequest) {
  const requestedLang = request.nextUrl.searchParams.get("lang");
  const cookieLang = request.cookies.get("lang")?.value;
  const locale = requestedLang
    ? parseLocale(requestedLang)
    : cookieLang
      ? parseLocale(cookieLang)
      : localeFromAcceptLanguage(request.headers.get("accept-language"));

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-talk-locale", locale);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (requestedLang) {
    response.cookies.set("lang", locale, {
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
