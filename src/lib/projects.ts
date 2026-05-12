import { getSanityClient } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import type { Image } from "sanity";

/* ============================================
   Project Data — Sanity Queries + Fallbacks
   ============================================ */

export type GalleryLayout =
  | "full"
  | "two-col"
  | "one-two"
  | "two-one"
  | "three-col"
  | "hero-two"
  | "portrait-stack"
  | "grid";

export type GalleryImageOrientation = "landscape" | "portrait" | "square";
export type GalleryAspectRatio =
  | "auto"
  | "1 / 1"
  | "4 / 3"
  | "3 / 4"
  | "16 / 9"
  | "9 / 16"
  | "4 / 5"
  | "5 / 4"
  | "3 / 2"
  | "2 / 3";

export interface GalleryImage {
  src: string;
  orientation: GalleryImageOrientation;
  aspectRatio?: GalleryAspectRatio;
  width?: number;
  height?: number;
}

export type GalleryImageSlot = GalleryImage | null;

export interface GalleryRow {
  layout: GalleryLayout;
  images: GalleryImageSlot[];
}

export interface Project {
  slug: string;
  title: string;
  year: string;
  folderColor: string;
  thumbnail: string;
  description: string;
  scope?: string;
  actions?: string;
  gallery: GalleryRow[];
}

interface SanityGalleryImage extends Image {
  asset?: Image["asset"] & {
    metadata?: {
      dimensions?: {
        aspectRatio?: number;
        width?: number;
        height?: number;
      };
    };
  };
}

interface SanityGalleryImageWithRatio {
  _type?: "galleryImage";
  image?: SanityGalleryImage;
  aspectRatio?: GalleryAspectRatio;
}

interface SanityGalleryEmptySlot {
  _type?: "galleryEmptySlot";
}

interface SanityGalleryBlock {
  layout?: GalleryLayout;
  aspectRatio?: GalleryAspectRatio;
  images?: (SanityGalleryImage | SanityGalleryImageWithRatio | SanityGalleryEmptySlot | null | 0)[];
}

interface SanityProject {
  slug?: { current?: string };
  title?: string;
  year?: string;
  folderColor?: string;
  thumbnail?: Image;
  description?: string;
  scope?: string;
  actions?: string;
  gallery?: SanityGalleryBlock[];
}

export const hardcodedProjects: Project[] = [
  {
    slug: "adrenaline",
    title: "Adrenaline",
    year: "2024",
    folderColor: "#D4E157",
    thumbnail: "/images/adrenaline.png",
    description:
      "Projekt identyfikacji wizualnej dla marki sportowej Adrenaline. Obejmował stworzenie logo, systemu kolorów, typografii oraz materiałów marketingowych.",
    scope: "Branding, Logo, Social Media",
    actions: "Identyfikacja wizualna, Key Visual",
    gallery: [
      { layout: "full", images: [{ src: "/images/adrenaline.png", orientation: "landscape" }] },
      {
        layout: "two-col",
        images: [
          { src: "/images/adrenaline.png", orientation: "landscape" },
          { src: "/images/adrenaline.png", orientation: "landscape" },
        ],
      },
    ],
  },
  {
    slug: "omt",
    title: "OMT",
    year: "2024",
    folderColor: "#64B5F6",
    thumbnail: "/images/omt.png",
    description:
      "Kompleksowy projekt brandingowy dla firmy OMT, obejmujący identyfikację wizualną, materiały drukowane oraz cyfrowe.",
    scope: "Branding, Print, Digital",
    actions: "Logo, Materiały drukowane, Strona WWW",
    gallery: [
      { layout: "full", images: [{ src: "/images/omt.png", orientation: "landscape" }] },
      {
        layout: "three-col",
        images: [
          { src: "/images/omt.png", orientation: "landscape" },
          { src: "/images/omt.png", orientation: "landscape" },
          { src: "/images/omt.png", orientation: "landscape" },
        ],
      },
    ],
  },
  {
    slug: "dentystka",
    title: "Gabinet Dentystyczny",
    year: "2023",
    folderColor: "#CE93D8",
    thumbnail: "/images/dentystka.png",
    description:
      "Rebranding gabinetu dentystycznego — od nowego logo, przez materiały informacyjne, po projekt wnętrza gabinetu.",
    scope: "Rebranding, Wnętrza",
    actions: "Logo, Wizytówki, Projekt wnętrza",
    gallery: [
      { layout: "full", images: [{ src: "/images/dentystka.png", orientation: "landscape" }] },
      {
        layout: "two-one",
        images: [
          { src: "/images/dentystka.png", orientation: "landscape" },
          { src: "/images/dentystka.png", orientation: "landscape" },
          { src: "/images/dentystka.png", orientation: "landscape" },
        ],
      },
    ],
  },
];

function getImageOrientation(image: SanityGalleryImage): GalleryImageOrientation {
  const aspectRatio = image.asset?.metadata?.dimensions?.aspectRatio;

  if (!aspectRatio) {
    return "landscape";
  }

  if (aspectRatio < 0.9) {
    return "portrait";
  }

  if (aspectRatio > 1.1) {
    return "landscape";
  }

  return "square";
}

function hasValidImageAsset(image?: SanityGalleryImage | Image): image is SanityGalleryImage {
  if (!image?.asset) {
    return false;
  }

  const asset = image.asset as Image["asset"] & {
    _id?: string;
    _ref?: string;
    url?: string;
  };

  return Boolean(asset._ref || asset._id || asset.url);
}

function getSanityImageUrl(image?: SanityGalleryImage | Image): string {
  if (!hasValidImageAsset(image)) {
    return "";
  }

  return urlForImage(image).url();
}

function isGalleryImageWithRatio(
  item: SanityGalleryImage | SanityGalleryImageWithRatio | SanityGalleryEmptySlot
): item is SanityGalleryImageWithRatio {
  return "_type" in item && item._type === "galleryImage";
}

function isGalleryEmptySlot(
  item: SanityGalleryImage | SanityGalleryImageWithRatio | SanityGalleryEmptySlot
): item is SanityGalleryEmptySlot {
  return "_type" in item && item._type === "galleryEmptySlot";
}

function getGalleryImageSource(
  item: SanityGalleryImage | SanityGalleryImageWithRatio | SanityGalleryEmptySlot | null | 0
): { image?: SanityGalleryImage; aspectRatio?: GalleryAspectRatio } {
  if (!item) {
    return {};
  }

  if (isGalleryEmptySlot(item)) {
    return {};
  }

  if (isGalleryImageWithRatio(item)) {
    return {
      image: item.image,
      aspectRatio: item.aspectRatio,
    };
  }

  return { image: item };
}

function mapGalleryImage(
  item: SanityGalleryImage | SanityGalleryImageWithRatio | SanityGalleryEmptySlot | null | 0,
  blockAspectRatio?: GalleryAspectRatio
): GalleryImageSlot {
  const { image, aspectRatio } = getGalleryImageSource(item);
  const src = getSanityImageUrl(image);

  if (!src || !image) {
    return null;
  }

  const dimensions = image.asset?.metadata?.dimensions;

  return {
    src,
    orientation: getImageOrientation(image),
    aspectRatio:
      aspectRatio && aspectRatio !== "auto"
        ? aspectRatio
        : blockAspectRatio && blockAspectRatio !== "auto"
          ? blockAspectRatio
          : undefined,
    width: dimensions?.width,
    height: dimensions?.height,
  };
}

function mapSanityProject(p: SanityProject): Project | undefined {
  const slug = p.slug?.current;

  if (!slug || !p.title) {
    return undefined;
  }

  return {
    slug,
    title: p.title,
    year: p.year || "",
    folderColor: p.folderColor || "#dddddd",
    thumbnail: getSanityImageUrl(p.thumbnail),
    description: p.description || "",
    scope: p.scope || "",
    actions: p.actions || "",
    gallery: p.gallery
      ? p.gallery.map((g) => ({
          layout: g.layout || "full",
          images: g.images
            ? g.images.map((image) => mapGalleryImage(image, g.aspectRatio))
            : []
        })).filter((g) => g.images.some(Boolean))
      : []
  };
}

export async function getProjects(preview = false): Promise<Project[]> {
  try {
    const sanityProjects = await getSanityClient(preview).fetch<SanityProject[]>(`*[_type == "project"] | order(order asc, _createdAt desc){
      ...,
      gallery[]{
        layout,
        aspectRatio,
        images[]{
          ...,
          image{
            ...,
            asset->{
              _id,
              url,
              metadata {
                dimensions
              }
            }
          },
          asset->{
            _id,
            url,
            metadata {
              dimensions
            }
          }
        }
      }
    }`);
    if (sanityProjects && sanityProjects.length > 0) {
      const mappedProjects = sanityProjects
        .map(mapSanityProject)
        .filter((project): project is Project => Boolean(project));

      if (mappedProjects.length > 0) {
        return mappedProjects;
      }
    }
  } catch (error) {
    console.error("Error fetching projects from Sanity:", error);
  }
  
  return hardcodedProjects;
}

export async function getProjectBySlug(slug: string, preview = false): Promise<Project | undefined> {
  try {
    const p = await getSanityClient(preview).fetch<SanityProject | null>(`*[_type == "project" && slug.current == $slug][0]{
      ...,
      gallery[]{
        layout,
        aspectRatio,
        images[]{
          ...,
          image{
            ...,
            asset->{
              _id,
              url,
              metadata {
                dimensions
              }
            }
          },
          asset->{
            _id,
            url,
            metadata {
              dimensions
            }
          }
        }
      }
    }`, { slug });
    if (p) {
      const project = mapSanityProject(p);

      if (project) {
        return project;
      }
    }
  } catch (error) {
    console.error("Error fetching project from Sanity:", error);
  }
  
  return hardcodedProjects.find((p) => p.slug === slug);
}
