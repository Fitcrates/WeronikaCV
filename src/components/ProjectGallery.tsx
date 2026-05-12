"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties } from "react";
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

interface LoadSequenceState {
  activeRowIndex: number;
  completedMediaKeys: Set<string>;
}

function getRenderableRows(rows: GalleryRow[]): RenderableGalleryRow[] {
  return rows.map((row) => ({
    className: `gallery-row--${row.layout}`,
    images: row.images,
  }));
}

function getMediaFrameStyle(media: NonNullable<GalleryMediaSlot>): CSSProperties {
  const naturalAspectRatio =
    "width" in media && media.width && media.height
      ? `${media.width} / ${media.height}`
      : "3 / 2";

  return {
    "--gallery-natural-aspect-ratio": naturalAspectRatio,
    ...(media.aspectRatio
      ? { "--gallery-image-aspect-ratio": media.aspectRatio }
      : {}),
  } as CSSProperties;
}

function getSizesForLayout(layout: string, imageIndex: number): string {
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

const PRIORITY_ROW_COUNT = 2;
const prefetchedZoomImages = new Map<string, HTMLImageElement>();

function prefetchZoomImage(src: string) {
  if (typeof window === "undefined" || prefetchedZoomImages.has(src)) return;

  const image = new window.Image();
  image.decoding = "async";
  image.src = src;
  prefetchedZoomImages.set(src, image);
}

function getMediaKey(rowIndex: number, mediaIndex: number) {
  return `${rowIndex}-${mediaIndex}`;
}

function getRowMediaKeys(row: RenderableGalleryRow | undefined, rowIndex: number) {
  if (!row) return [];

  return row.images
    .map((media, mediaIndex) =>
      media ? getMediaKey(rowIndex, mediaIndex) : null
    )
    .filter((key): key is string => Boolean(key));
}

function getNextPendingRowIndex(
  rows: RenderableGalleryRow[],
  startRowIndex: number,
  completedMediaKeys: Set<string>
) {
  let nextRowIndex = startRowIndex;

  while (nextRowIndex < rows.length) {
    const rowKeys = getRowMediaKeys(rows[nextRowIndex], nextRowIndex);
    const isRowComplete =
      rowKeys.length === 0 ||
      rowKeys.every((key) => completedMediaKeys.has(key));

    if (!isRowComplete) break;
    nextRowIndex += 1;
  }

  return nextRowIndex;
}

export default function ProjectGallery({ rows }: ProjectGalleryProps) {
  const renderableRows = getRenderableRows(rows);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [zoomedImage, setZoomedImage] = useState<GalleryZoomImage | null>(null);
  const [loadSequence, setLoadSequence] = useState<LoadSequenceState>(() => ({
    activeRowIndex: getNextPendingRowIndex(renderableRows, 0, new Set()),
    completedMediaKeys: new Set(),
  }));

  function markMediaComplete(mediaKey: string) {
    setLoadSequence((current) => {
      if (current.completedMediaKeys.has(mediaKey)) {
        return current;
      }

      const completedMediaKeys = new Set(current.completedMediaKeys);
      completedMediaKeys.add(mediaKey);

      return {
        completedMediaKeys,
        activeRowIndex: getNextPendingRowIndex(
          renderableRows,
          current.activeRowIndex,
          completedMediaKeys
        ),
      };
    });
  }

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;

    const items = gallery.querySelectorAll<HTMLElement>(".gallery__item");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("gallery__item--visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "50px 0px",
        threshold: 0.05,
      }
    );

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [rows]);

  return (
    <>
      <div ref={galleryRef} className="gallery">
        {renderableRows.map((row, rowIdx) => {
          const isAboveFold = rowIdx < PRIORITY_ROW_COUNT;
          const isRowLoadAllowed = rowIdx <= loadSequence.activeRowIndex;
          const isActiveRow = rowIdx === loadSequence.activeRowIndex;

          return (
            <div key={rowIdx} className={row.className}>
              {row.images.map((media, imgIdx) => {
                const imageAlt = `Galeria zdjęcie ${rowIdx + 1}-${imgIdx + 1}`;
                const imageId = `${rowIdx}-${imgIdx}-${media?.src ?? "empty"}`;
                const mediaKey = getMediaKey(rowIdx, imgIdx);

                return (
                  <figure
                    key={`${rowIdx}-${imgIdx}`}
                    className={`gallery__item${media ? "" : " gallery__item--empty"}${isAboveFold || !isRowLoadAllowed ? " gallery__item--visible" : ""}`}
                    style={media ? getMediaFrameStyle(media) : undefined}
                  >
                    {!isRowLoadAllowed ? null : media?.kind === "video" ? (
                      <video
                        className="gallery__video"
                        controls
                        playsInline
                        preload="metadata"
                        poster={media.poster}
                        onLoadedMetadata={() => markMediaComplete(mediaKey)}
                        onError={() => markMediaComplete(mediaKey)}
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
                            src={media.src}
                            alt={imageAlt}
                            fill
                            className="gallery__image"
                            sizes={getSizesForLayout(row.className, imgIdx)}
                            loading="eager"
                            fetchPriority={isActiveRow ? "high" : "auto"}
                            onLoad={() => markMediaComplete(mediaKey)}
                            onError={() => markMediaComplete(mediaKey)}
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
