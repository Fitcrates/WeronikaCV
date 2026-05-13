import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_COOKIE_NAME = "portfolio_access";
const DRAFT_MODE_COOKIE_NAME = "__prerender_bypass";
const SANITY_PREVIEW_HEADER = "x-sanity-presentation-preview";
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

function isSanityPresentationPreview(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const referer = request.headers.get("referer");
  const secFetchDest = request.headers.get("sec-fetch-dest");
  let refererUrl: URL | null = null;

  if (referer) {
    try {
      refererUrl = new URL(referer);
    } catch {
      refererUrl = null;
    }
  }

  const isSanityReferer =
    refererUrl?.hostname === "sanity.io" || refererUrl?.hostname.endsWith(".sanity.io");

  return (
    searchParams.has("sanity-preview-perspective") ||
    searchParams.has("sanity-preview-secret") ||
    Boolean(
      refererUrl?.searchParams.has("sanity-preview-perspective") ||
        refererUrl?.searchParams.has("sanity-preview-secret")
    ) ||
    Boolean(isSanityReferer && (!secFetchDest || secFetchDest === "iframe")) ||
    request.cookies.has("sanity-preview-perspective")
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPreview = isSanityPresentationPreview(request);

  if (isPreview) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(SANITY_PREVIEW_HEADER, "1");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const accessCookie = request.cookies.get(ACCESS_COOKIE_NAME)?.value;

  if (accessCookie === getAccessToken() || request.cookies.has(DRAFT_MODE_COOKIE_NAME)) {
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
