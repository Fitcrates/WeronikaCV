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
  | "grid";

export type GalleryImageOrientation = "landscape" | "portrait" | "square";

export interface GalleryImage {
  src: string;
  orientation: GalleryImageOrientation;
}

export interface GalleryRow {
  layout: GalleryLayout;
  images: GalleryImage[];
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

interface SanityGalleryBlock {
  layout?: GalleryLayout;
  images?: SanityGalleryImage[];
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
    thumbnail: p.thumbnail ? urlForImage(p.thumbnail).url() : "",
    description: p.description || "",
    scope: p.scope || "",
    actions: p.actions || "",
    gallery: p.gallery
      ? p.gallery.map((g) => ({
          layout: g.layout || "full",
          images: g.images
            ? g.images.map((img) => ({
                src: urlForImage(img).url(),
                orientation: getImageOrientation(img),
              }))
            : []
        })).filter((g) => g.images.length > 0)
      : []
  };
}

export async function getProjects(preview = false): Promise<Project[]> {
  try {
    const sanityProjects = await getSanityClient(preview).fetch<SanityProject[]>(`*[_type == "project"] | order(order asc, _createdAt desc){
      ...,
      gallery[]{
        layout,
        images[]{
          ...,
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
        images[]{
          ...,
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
