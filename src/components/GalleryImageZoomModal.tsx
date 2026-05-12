"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, type CSSProperties } from "react";

export interface GalleryZoomImage {
  id: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

interface GalleryImageZoomModalProps {
  image: GalleryZoomImage | null;
  onClose: () => void;
}

export default function GalleryImageZoomModal({
  image,
  onClose,
}: GalleryImageZoomModalProps) {
  useEffect(() => {
    if (!image) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [image, onClose]);

  const naturalWidth = image?.width ?? 1600;
  const naturalHeight = image?.height ?? 1000;

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {image ? (
        <motion.div
          className="gallery-zoom"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={onClose}
        >
          <button
            type="button"
            className="gallery-zoom__close"
            aria-label="Zamknij powiększenie zdjęcia"
            onClick={onClose}
          >
            ×
          </button>

          <motion.div
            className="gallery-zoom__frame"
            layoutId={`gallery-image-${image.id}`}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            style={
              {
                "--gallery-zoom-natural-width": `${naturalWidth}px`,
                "--gallery-zoom-natural-height": `${naturalHeight}px`,
              } as CSSProperties
            }
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={naturalWidth}
              height={naturalHeight}
              className="gallery-zoom__image"
              quality={100}
              unoptimized
              priority
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
