import Image from "next/image";
import type { GalleryImage, GalleryRow } from "@/lib/projects";

interface ProjectGalleryProps {
  rows: GalleryRow[];
}

interface RenderableGalleryRow {
  className: string;
  images: GalleryImage[];
}

function getRenderableRows(rows: GalleryRow[]): RenderableGalleryRow[] {
  return rows.flatMap((row) => {
    const portraitIndex = row.images.findIndex((image) => image.orientation === "portrait");

    if (portraitIndex >= 0) {
      if (row.images.length < 3) {
        return [];
      }

      const portraitImage = row.images[portraitIndex];
      const supportingImages = row.images.filter((_, index) => index !== portraitIndex).slice(0, 2);

      return [{
        className: "gallery-row--portrait-stack",
        images: [portraitImage, ...supportingImages],
      }];
    }

    return [{
      className: `gallery-row--${row.layout}`,
      images: row.images,
    }];
  });
}

export default function ProjectGallery({ rows }: ProjectGalleryProps) {
  const renderableRows = getRenderableRows(rows);

  return (
    <div className="gallery">
      {renderableRows.map((row, rowIdx) => (
        <div key={rowIdx} className={row.className}>
          {row.images.map((image, imgIdx) => (
            <Image
              key={`${rowIdx}-${imgIdx}`}
              src={image.src}
              alt={`Galeria zdjęcie ${rowIdx + 1}-${imgIdx + 1}`}
              width={1200}
              height={800}
              style={{ width: "100%", height: "100%" }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
