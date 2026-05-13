"use client";

import Link from "next/link";
import type { LinkProps } from "next/link";
import { useSearchParams } from "next/navigation";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { preserveSanityPreviewParams } from "./previewLinks";

type PreviewAwareLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: ReactNode;
  };

export default function PreviewAwareLink({
  children,
  href,
  ...props
}: PreviewAwareLinkProps) {
  const searchParams = useSearchParams();
  const previewHref = preserveSanityPreviewParams(href, searchParams);

  return (
    <Link {...props} href={previewHref}>
      {children}
    </Link>
  );
}
