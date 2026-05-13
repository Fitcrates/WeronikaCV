import type { LinkProps } from "next/link";

function shouldPreserveParam(key: string) {
  return key.startsWith("sanity-preview-");
}

export function preserveSanityPreviewParams(
  href: LinkProps["href"],
  currentSearchParams: URLSearchParams | { forEach: URLSearchParams["forEach"] }
): LinkProps["href"] {
  if (typeof href !== "string" || href.startsWith("http") || href.startsWith("mailto:")) {
    return href;
  }

  const preservedParams = new URLSearchParams();

  currentSearchParams.forEach((value, key) => {
    if (shouldPreserveParam(key)) {
      preservedParams.set(key, value);
    }
  });

  if (preservedParams.size === 0) {
    return href;
  }

  const [hrefWithoutHash, hash = ""] = href.split("#");
  const [pathname, query = ""] = hrefWithoutHash.split("?");
  const nextParams = new URLSearchParams(query);

  preservedParams.forEach((value, key) => {
    if (!nextParams.has(key)) {
      nextParams.set(key, value);
    }
  });

  const nextQuery = nextParams.toString();
  const nextHash = hash ? `#${hash}` : "";

  return `${pathname}${nextQuery ? `?${nextQuery}` : ""}${nextHash}`;
}
