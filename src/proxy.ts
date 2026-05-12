import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_COOKIE_NAME = "portfolio_access";
const PUBLIC_FILE_PATTERN = /\.[^/]+$/;

function getAccessToken() {
  return process.env.PORTFOLIO_ACCESS_TOKEN || process.env.PORTFOLIO_ACCESS_PASSWORD || "portfolio";
}

function isPublicPath(pathname: string) {
  return (
    pathname === "/access" ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/studio") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE_PATTERN.test(pathname)
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const accessCookie = request.cookies.get(ACCESS_COOKIE_NAME)?.value;

  if (accessCookie === getAccessToken()) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/access";
  url.search = "";
  url.searchParams.set("from", `${pathname}${search}`);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
