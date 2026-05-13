"use client";

import Image from "next/image";
import type { ImageLoaderProps } from "next/image";
import { motion } from "framer-motion";
import { useState, type CSSProperties } from "react";
import type { GalleryMediaSlot, GalleryRow } from "@/lib/projects";
import GalleryImageZoomModal from "@/components/GalleryImageZoomModal";
import type { GalleryZoomImage } from "@/components/GalleryImageZoomModal";

interface ProjectGalleryProps {
  rows: GalleryRow[];
}

interface RenderableGalleryRow {
  className: string;
  images: GalleryMediaSlot[];
}

function getRenderableRows(rows: GalleryRow[]): RenderableGalleryRow[] {
  return rows.map((row) => ({
    className: `gallery-row--${row.layout}`,
    images: row.images,
  }));
}

function getMediaFrameStyle(media: NonNullable<GalleryMediaSlot>): CSSProperties {
  const customWidthPx = "customWidthPx" in media ? media.customWidthPx : undefined;
  const customHeightPx = "customHeightPx" in media ? media.customHeightPx : undefined;
  const naturalAspectRatio =
    "width" in media && media.width && media.height
      ? `${media.width} / ${media.height}`
      : "3 / 2";
  const customSizeAspectRatio =
    customWidthPx && customHeightPx ? `${customWidthPx} / ${customHeightPx}` : undefined;

  return {
    "--gallery-natural-aspect-ratio": naturalAspectRatio,
    ...(customSizeAspectRatio || media.aspectRatio
      ? { "--gallery-image-aspect-ratio": customSizeAspectRatio || media.aspectRatio }
      : {}),
    ...("objectPositionX" in media &&
    typeof media.objectPositionX === "number" &&
    typeof media.objectPositionY === "number"
      ? {
          "--gallery-object-position": `${media.objectPositionX}% ${media.objectPositionY}%`,
        }
      : {}),
    ...(customWidthPx ? { "--gallery-custom-width": `${customWidthPx}px` } : {}),
    ...(customHeightPx ? { "--gallery-custom-height": `${customHeightPx}px` } : {}),
  } as CSSProperties;
}

function hasCustomSize(media: GalleryMediaSlot) {
  return Boolean(
    media &&
      "customWidthPx" in media &&
      media.customWidthPx &&
      media.customHeightPx
  );
}

function getSizesForLayout(
  layout: string,
  imageIndex: number,
  media: GalleryMediaSlot
): string {
  if (media && "customWidthPx" in media && media.customWidthPx) {
    return `(max-width: 640px) 100vw, ${media.customWidthPx}px`;
  }

  switch (layout) {
    case "gallery-row--full":
      return "(max-width: 640px) 100vw, 1200px";
    case "gallery-row--two-col":
      return "(max-width: 640px) 100vw, 600px";
    case "gallery-row--three-col":
    case "gallery-row--grid":
      return "(max-width: 640px) 100vw, 400px";
    case "gallery-row--one-two":
      return imageIndex === 0
        ? "(max-width: 640px) 100vw, 600px"
        : "(max-width: 640px) 100vw, 600px";
    case "gallery-row--two-one":
      return "(max-width: 640px) 100vw, 600px";
    case "gallery-row--hero-two":
      return imageIndex === 0
        ? "(max-width: 640px) 100vw, 1200px"
        : "(max-width: 640px) 100vw, 600px";
    case "gallery-row--portrait-stack":
      return "(max-width: 640px) 100vw, 600px";
    default:
      return "(max-width: 640px) 100vw, 1200px";
  }
}

function sanityImageLoader({ src, width, quality }: ImageLoaderProps) {
  if (!src.startsWith("https://cdn.sanity.io/")) {
    return src;
  }

  const url = new URL(src);
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));

  return url.toString();
}

const prefetchedZoomImages = new Map<string, HTMLImageElement>();

function prefetchZoomImage(src: string) {
  if (typeof window === "undefined" || prefetchedZoomImages.has(src)) return;

  const image = new window.Image();
  image.decoding = "async";
  image.src = src;
  prefetchedZoomImages.set(src, image);
}

export default function ProjectGallery({ rows }: ProjectGalleryProps) {
  const renderableRows = getRenderableRows(rows);
  const [zoomedImage, setZoomedImage] = useState<GalleryZoomImage | null>(null);

  return (
    <>
      <div className="gallery">
        {renderableRows.map((row, rowIdx) => {
          const isFirstRow = rowIdx === 0;
          const shouldEagerLoad = rowIdx < 3;

          return (
            <div key={rowIdx} className={row.className}>
              {row.images.map((media, imgIdx) => {
                const imageAlt = `Galeria zdjęcie ${rowIdx + 1}-${imgIdx + 1}`;
                const imageId = `${rowIdx}-${imgIdx}-${media?.src ?? "empty"}`;

                return (
                  <figure
                    key={`${rowIdx}-${imgIdx}`}
                    className={`gallery__item gallery__item--visible${media ? "" : " gallery__item--empty"}${hasCustomSize(media) ? " gallery__item--custom-size" : ""}`}
                    style={media ? getMediaFrameStyle(media) : undefined}
                  >
                    {media?.kind === "video" ? (
                      <video
                        className="gallery__video"
                        controls
                        playsInline
                        preload={shouldEagerLoad ? "metadata" : "none"}
                        poster={media.poster}
                      >
                        <source
                          src={media.src}
                          type={media.mimeType || "video/mp4"}
                        />
                      </video>
                    ) : media ? (
                      <button
                        type="button"
                        className="gallery__zoom-trigger"
                        aria-label={`Powiększ zdjęcie ${rowIdx + 1}-${imgIdx + 1}`}
                        onFocus={() => prefetchZoomImage(media.src)}
                        onMouseEnter={() => prefetchZoomImage(media.src)}
                        onTouchStart={() => prefetchZoomImage(media.src)}
                        onClick={() =>
                          setZoomedImage({
                            id: imageId,
                            src: media.src,
                            alt: imageAlt,
                            width: media.width,
                            height: media.height,
                          })
                        }
                      >
                        <motion.span
                          className="gallery__zoom-media"
                          layoutId={`gallery-image-${imageId}`}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 30,
                          }}
                        >
                          <Image
                            loader={sanityImageLoader}
                            src={media.src}
                            alt={imageAlt}
                            fill
                            className="gallery__image"
                            sizes={getSizesForLayout(row.className, imgIdx, media)}
                            loading={shouldEagerLoad ? "eager" : "lazy"}
                            fetchPriority={isFirstRow ? "high" : "auto"}
                            quality={75}
                          />
                        </motion.span>
                      </button>
                    ) : null}
                  </figure>
                );
              })}
            </div>
          );
        })}
      </div>

      <GalleryImageZoomModal
        image={zoomedImage}
        onClose={() => setZoomedImage(null)}
      />
    </>
  );
}
