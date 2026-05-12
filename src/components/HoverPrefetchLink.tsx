"use client";

import Link from "next/link";
import type { LinkProps } from "next/link";
import { useState, type AnchorHTMLAttributes, type ReactNode } from "react";

type HoverPrefetchLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: ReactNode;
  };

export default function HoverPrefetchLink({
  children,
  prefetch,
  onFocus,
  onMouseEnter,
  onTouchStart,
  ...props
}: HoverPrefetchLinkProps) {
  const [isPrefetchEnabled, setIsPrefetchEnabled] = useState(false);

  const enablePrefetch = () => setIsPrefetchEnabled(true);

  return (
    <Link
      {...props}
      prefetch={isPrefetchEnabled ? (prefetch ?? null) : false}
      onFocus={(event) => {
        enablePrefetch();
        onFocus?.(event);
      }}
      onMouseEnter={(event) => {
        enablePrefetch();
        onMouseEnter?.(event);
      }}
      onTouchStart={(event) => {
        enablePrefetch();
        onTouchStart?.(event);
      }}
    >
      {children}
    </Link>
  );
}
