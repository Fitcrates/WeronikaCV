import Image from "next/image";
import type { CSSProperties } from "react";
import type { GalleryImage, GalleryImageSlot, GalleryRow } from "@/lib/projects";

interface ProjectGalleryProps {
  rows: GalleryRow[];
}

interface RenderableGalleryRow {
  className: string;
  images: GalleryImageSlot[];
}

function getRenderableRows(rows: GalleryRow[]): RenderableGalleryRow[] {
  return rows.map((row) => ({
    className: `gallery-row--${row.layout}`,
    images: row.images,
  }));
}

function getImageFrameStyle(image: GalleryImage): CSSProperties {
  const naturalAspectRatio =
    image.width && image.height ? `${image.width} / ${image.height}` : "3 / 2";

  return {
    "--gallery-natural-aspect-ratio": naturalAspectRatio,
    ...(image.aspectRatio
      ? { "--gallery-image-aspect-ratio": image.aspectRatio }
      : {}),
  } as CSSProperties;
}

export default function ProjectGallery({ rows }: ProjectGalleryProps) {
  const renderableRows = getRenderableRows(rows);

  return (
    <div className="gallery">
      {renderableRows.map((row, rowIdx) => (
        <div key={rowIdx} className={row.className}>
          {row.images.map((image, imgIdx) => (
            <figure
              key={`${rowIdx}-${imgIdx}`}
              className={`gallery__item${image ? "" : " gallery__item--empty"}`}
              style={image ? getImageFrameStyle(image) : undefined}
            >
              {image ? (
                <Image
                  src={image.src}
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
