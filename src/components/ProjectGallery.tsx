import Image from "next/image";
import type { CSSProperties } from "react";
import type { GalleryMediaSlot, GalleryRow } from "@/lib/projects";

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

export default function ProjectGallery({ rows }: ProjectGalleryProps) {
  const renderableRows = getRenderableRows(rows);

  return (
    <div className="gallery">
      {renderableRows.map((row, rowIdx) => (
        <div key={rowIdx} className={row.className}>
          {row.images.map((media, imgIdx) => (
            <figure
              key={`${rowIdx}-${imgIdx}`}
              className={`gallery__item${media ? "" : " gallery__item--empty"}`}
              style={media ? getMediaFrameStyle(media) : undefined}
            >
              {media?.kind === "video" ? (
                <video
                  className="gallery__video"
                  controls
                  playsInline
                  preload="metadata"
                  poster={media.poster}
                >
                  <source src={media.src} type={media.mimeType || "video/mp4"} />
                </video>
              ) : media ? (
                <Image
                  src={media.src}
                  alt={`Galeria zdjęcie ${rowIdx + 1}-${imgIdx + 1}`}
                  fill
                  className="gallery__image"
                  sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 1200px"
                />
              ) : null}
            </figure>
          ))}
        </div>
      ))}
    </div>
  );
}
