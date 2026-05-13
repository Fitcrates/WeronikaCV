"use client";

import {
  useMemo,
  useState,
  type CSSProperties,
  type DragEvent,
  type PointerEvent,
} from "react";
import { PatchEvent, set, type ObjectInputProps } from "sanity";
import { createImageUrlBuilder } from "@sanity/image-url";
import { dataset, projectId } from "../env";

type GalleryLayout =
  | "full"
  | "two-col"
  | "one-two"
  | "two-one"
  | "three-col"
  | "hero-two"
  | "portrait-stack"
  | "grid";

interface GalleryImageValue {
  _type?: string;
  _key?: string;
  image?: {
    asset?: {
      _ref?: string;
      _id?: string;
      url?: string;
    };
    crop?: unknown;
    hotspot?: unknown;
  };
  asset?: {
    _ref?: string;
    _id?: string;
    url?: string;
  };
  aspectRatio?: string;
  customAspectRatio?: string;
  objectPositionX?: number;
  objectPositionY?: number;
}

interface GalleryBlockValue {
  _type?: string;
  _key?: string;
  layout?: GalleryLayout;
  aspectRatio?: string;
  customAspectRatio?: string;
  images?: GalleryImageValue[];
}

const layoutOptions: { value: GalleryLayout; title: string; slots: number }[] = [
  { value: "full", title: "Full", slots: 1 },
  { value: "two-col", title: "2 kolumny", slots: 2 },
  { value: "one-two", title: "1 + 2", slots: 3 },
  { value: "two-one", title: "2 + 1", slots: 3 },
  { value: "three-col", title: "3 kolumny", slots: 3 },
  { value: "hero-two", title: "Hero + 2", slots: 3 },
  { value: "portrait-stack", title: "Portret + 2", slots: 3 },
  { value: "grid", title: "Siatka", slots: 6 },
];

const ratioPresets = [
  { label: "Auto", value: "auto" },
  { label: "1:1", value: "1 / 1" },
  { label: "4:3", value: "4 / 3" },
  { label: "3:4", value: "3 / 4" },
  { label: "16:9", value: "16 / 9" },
  { label: "4:5", value: "4 / 5" },
];

const imageBuilder = createImageUrlBuilder({
  projectId,
  dataset,
});

function getItemImage(item?: GalleryImageValue) {
  if (!item) return undefined;
  if (item._type === "galleryImage") return item.image;
  return item;
}

function getImageUrl(item?: GalleryImageValue) {
  const image = getItemImage(item);

  if (!image?.asset) {
    return undefined;
  }

  return image.asset.url || imageBuilder.image(image).width(480).height(360).url();
}

function getRatio(value?: GalleryImageValue, block?: GalleryBlockValue) {
  const ratio =
    value?.aspectRatio === "custom"
      ? value.customAspectRatio
      : value?.aspectRatio && value.aspectRatio !== "auto"
        ? value.aspectRatio
        : block?.aspectRatio === "custom"
          ? block.customAspectRatio
          : block?.aspectRatio;

  return ratio && ratio !== "auto" ? ratio : "4 / 3";
}

function ensureGalleryImage(item?: GalleryImageValue): GalleryImageValue {
  if (!item || item._type === "galleryEmptySlot") {
    return {
      _type: "galleryImage",
      _key: item?._key || "gallery-slot",
      aspectRatio: "auto",
      objectPositionX: 50,
      objectPositionY: 50,
    };
  }

  if (!item._type) {
    return {
      _type: "galleryImage",
      _key: item._key || "legacy-slot",
      image: item,
      aspectRatio: "auto",
      objectPositionX: 50,
      objectPositionY: 50,
    };
  }

  return {
    ...item,
    objectPositionX: item.objectPositionX ?? 50,
    objectPositionY: item.objectPositionY ?? 50,
  };
}

function GallerySlot({
  index,
  item,
  block,
  selected,
  onSelect,
  onDragStart,
  onDrop,
  onPan,
}: {
  index: number;
  item?: GalleryImageValue;
  block: GalleryBlockValue;
  selected: boolean;
  onSelect: () => void;
  onDragStart: (event: DragEvent<HTMLButtonElement>) => void;
  onDrop: (event: DragEvent<HTMLButtonElement>) => void;
  onPan: (x: number, y: number) => void;
}) {
  const imageUrl = getImageUrl(item);
  const positionX = item?.objectPositionX ?? 50;
  const positionY = item?.objectPositionY ?? 50;
  const [panStart, setPanStart] = useState<{
    pointerX: number;
    pointerY: number;
    imageX: number;
    imageY: number;
  } | null>(null);

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    onSelect();

    if (!selected || !imageUrl) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    setPanStart({
      pointerX: event.clientX,
      pointerY: event.clientY,
      imageX: positionX,
      imageY: positionY,
    });
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!panStart) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const nextX = clamp(
      panStart.imageX - ((event.clientX - panStart.pointerX) / bounds.width) * 100
    );
    const nextY = clamp(
      panStart.imageY - ((event.clientY - panStart.pointerY) / bounds.height) * 100
    );

    onPan(nextX, nextY);
  }

  return (
    <button
      type="button"
      draggable={!selected}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={() => setPanStart(null)}
      onPointerCancel={() => setPanStart(null)}
      onDragStart={onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      style={{
        ...slotStyle,
        aspectRatio: getRatio(item, block),
        cursor: selected && imageUrl ? "grab" : "pointer",
        outline: selected ? "2px solid #111" : "1px dashed rgba(0,0,0,.32)",
      }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "cover",
            objectPosition: `${positionX}% ${positionY}%`,
          }}
        />
      ) : (
        <span style={emptySlotStyle}>Slot {index + 1}</span>
      )}
    </button>
  );
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export default function GalleryBlockInput(props: ObjectInputProps) {
  const value = (props.value || {}) as GalleryBlockValue;
  const layout = value.layout || "full";
  const images = useMemo(() => value.images || [], [value.images]);
  const slotCount =
    Math.max(images.length, layoutOptions.find((option) => option.value === layout)?.slots || 1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const selectedItem = ensureGalleryImage(images[selectedIndex]);

  function patchValue(nextValue: GalleryBlockValue) {
    props.onChange(PatchEvent.from(set(nextValue)));
  }

  function setLayout(nextLayout: GalleryLayout) {
    patchValue({ ...value, layout: nextLayout });
  }

  function updateImages(nextImages: GalleryImageValue[]) {
    patchValue({ ...value, images: nextImages });
  }

  function updateSelectedSlot(partial: Partial<GalleryImageValue>) {
    const nextImages = [...images];
    while (nextImages.length <= selectedIndex) {
      nextImages.push({
        _type: "galleryImage",
        _key: `slot-${nextImages.length + 1}`,
        aspectRatio: "auto",
        objectPositionX: 50,
        objectPositionY: 50,
      });
    }
    nextImages[selectedIndex] = {
      ...ensureGalleryImage(nextImages[selectedIndex]),
      ...partial,
    };
    updateImages(nextImages);
  }

  function reorderImages(from: number, to: number) {
    if (from === to || from < 0 || to < 0) return;

    const nextImages = [...images];
    const [moved] = nextImages.splice(from, 1);
    nextImages.splice(to, 0, moved);
    updateImages(nextImages);
    setSelectedIndex(to);
  }

  return (
    <div>
      <section style={panelStyle}>
        <div style={headerStyle}>
          <div>
            <strong style={titleStyle}>Kompozycja galerii</strong>
            <p style={mutedStyle}>Przeciągnij slot, zmień proporcje i ustaw kadr. Upload oraz hotspot są niżej w natywnych polach Sanity.</p>
          </div>
          <span style={pillStyle}>{images.length} media</span>
        </div>

        <div style={layoutPickerStyle}>
          {layoutOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setLayout(option.value)}
              style={{
                ...layoutButtonStyle,
                background: layout === option.value ? "#111" : "#fff",
                color: layout === option.value ? "#fff" : "#111",
              }}
            >
              {option.title}
            </button>
          ))}
        </div>

        <div style={{ ...previewGridStyle, ...getPreviewGridStyle(layout) }}>
          {Array.from({ length: slotCount }).map((_, index) => (
            <GallerySlot
              key={images[index]?._key || `empty-${index}`}
              index={index}
              item={images[index]}
              block={value}
              selected={index === selectedIndex}
              onSelect={() => setSelectedIndex(index)}
              onDragStart={() => setDragIndex(index)}
              onDrop={(event) => {
                event.preventDefault();
                if (dragIndex !== null) reorderImages(dragIndex, index);
                setDragIndex(null);
              }}
              onPan={(objectPositionX, objectPositionY) =>
                updateSelectedSlot({ objectPositionX, objectPositionY })
              }
            />
          ))}
        </div>

        {slotCount > 0 && (
          <div style={controlsStyle}>
            <div style={controlGroupStyle}>
              <label style={labelStyle}>Aspect ratio slotu</label>
              <div style={segmentedStyle}>
                {ratioPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => updateSelectedSlot({ aspectRatio: preset.value })}
                    style={{
                      ...segmentButtonStyle,
                      background:
                        selectedItem.aspectRatio === preset.value ||
                        (!selectedItem.aspectRatio && preset.value === "auto")
                          ? "#111"
                          : "#fff",
                      color:
                        selectedItem.aspectRatio === preset.value ||
                        (!selectedItem.aspectRatio && preset.value === "auto")
                          ? "#fff"
                          : "#111",
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={rangeGridStyle}>
              <label style={labelStyle}>
                Kadr poziomo
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={selectedItem.objectPositionX ?? 50}
                  onChange={(event) =>
                    updateSelectedSlot({ objectPositionX: Number(event.currentTarget.value) })
                  }
                  style={rangeStyle}
                />
              </label>
              <label style={labelStyle}>
                Kadr pionowo
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={selectedItem.objectPositionY ?? 50}
                  onChange={(event) =>
                    updateSelectedSlot({ objectPositionY: Number(event.currentTarget.value) })
                  }
                  style={rangeStyle}
                />
              </label>
            </div>
          </div>
        )}
      </section>

      {props.renderDefault(props)}
    </div>
  );
}

function getPreviewGridStyle(layout: GalleryLayout): CSSProperties {
  switch (layout) {
    case "full":
      return { gridTemplateColumns: "1fr" };
    case "two-col":
      return { gridTemplateColumns: "1fr 1fr" };
    case "three-col":
    case "grid":
      return { gridTemplateColumns: "repeat(3, 1fr)" };
    case "one-two":
    case "two-one":
    case "hero-two":
    case "portrait-stack":
      return { gridTemplateColumns: "1fr 1fr" };
    default:
      return {};
  }
}

const panelStyle: CSSProperties = {
  padding: 16,
  marginBottom: 16,
  border: "1px solid rgba(0,0,0,.12)",
  borderRadius: 8,
  background: "#fafaf7",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 14,
};

const titleStyle: CSSProperties = {
  display: "block",
  fontSize: 15,
  lineHeight: 1.2,
};

const mutedStyle: CSSProperties = {
  margin: "6px 0 0",
  color: "rgba(0,0,0,.58)",
  fontSize: 12,
  lineHeight: 1.45,
};

const pillStyle: CSSProperties = {
  height: 24,
  padding: "4px 8px",
  border: "1px solid rgba(0,0,0,.14)",
  borderRadius: 999,
  fontSize: 11,
  whiteSpace: "nowrap",
};

const layoutPickerStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  marginBottom: 14,
};

const layoutButtonStyle: CSSProperties = {
  border: "1px solid rgba(0,0,0,.18)",
  borderRadius: 6,
  padding: "7px 10px",
  fontSize: 12,
  cursor: "pointer",
};

const previewGridStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  alignItems: "start",
};

const slotStyle: CSSProperties = {
  position: "relative",
  minHeight: 88,
  padding: 0,
  overflow: "hidden",
  border: 0,
  borderRadius: 6,
  background: "#fff",
  cursor: "grab",
};

const emptySlotStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  color: "rgba(0,0,0,.42)",
  fontSize: 12,
};

const controlsStyle: CSSProperties = {
  marginTop: 14,
  display: "grid",
  gap: 14,
};

const controlGroupStyle: CSSProperties = {
  display: "grid",
  gap: 6,
};

const labelStyle: CSSProperties = {
  display: "grid",
  gap: 6,
  fontSize: 12,
  fontWeight: 600,
};

const segmentedStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
};

const segmentButtonStyle: CSSProperties = {
  border: "1px solid rgba(0,0,0,.18)",
  borderRadius: 6,
  padding: "6px 9px",
  fontSize: 12,
  cursor: "pointer",
};

const rangeGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
};

const rangeStyle: CSSProperties = {
  width: "100%",
};
