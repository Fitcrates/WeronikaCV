import { sanityFetch } from "@/sanity/live";
import { urlForImage } from "@/sanity/lib/image";
import { createDataAttribute, stegaClean } from "next-sanity";
import { dataset, projectId } from "@/sanity/env";
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
export type GalleryAspectRatio = string;

export interface GalleryImage {
  kind?: "image";
  src: string;
  edit?: string;
  orientation: GalleryImageOrientation;
  aspectRatio?: GalleryAspectRatio;
  customWidthPx?: number;
  customHeightPx?: number;
  objectPositionX?: number;
  objectPositionY?: number;
  width?: number;
  height?: number;
  lqip?: string;
}

export interface GalleryVideo {
  kind: "video";
  src: string;
  edit?: string;
  poster?: string;
  aspectRatio?: GalleryAspectRatio;
  mimeType?: string;
}

export type GalleryMediaSlot = GalleryImage | GalleryVideo | null;
export type GalleryImageSlot = GalleryMediaSlot;

export interface GalleryRow {
  layout: GalleryLayout;
  edit?: string;
  images: GalleryMediaSlot[];
}

export interface Project {
  edit?: string;
  titleEdit?: string;
  descriptionEdit?: string;
  scopeEdit?: string;
  actionsEdit?: string;
  yearEdit?: string;
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
      lqip?: string;
    };
  };
}

interface SanityGalleryImageWithRatio {
  _type?: "galleryImage";
  _key?: string;
  image?: SanityGalleryImage;
  aspectRatio?: GalleryAspectRatio;
  customAspectRatio?: string;
  customWidthPx?: number;
  customHeightPx?: number;
  objectPositionX?: number;
  objectPositionY?: number;
}

interface SanityGalleryEmptySlot {
  _type?: "galleryEmptySlot";
  _key?: string;
}

interface SanityGalleryVideo {
  _type?: "galleryVideo";
  _key?: string;
  video?: {
    asset?: {
      _ref?: string;
      _id?: string;
      url?: string;
      mimeType?: string;
    };
  };
  poster?: SanityGalleryImage;
  aspectRatio?: GalleryAspectRatio;
  customAspectRatio?: string;
}

interface SanityGalleryBlock {
  _key?: string;
  layout?: GalleryLayout;
  aspectRatio?: GalleryAspectRatio;
  customAspectRatio?: string;
  images?: (
    | SanityGalleryImage
    | SanityGalleryImageWithRatio
    | SanityGalleryVideo
    | SanityGalleryEmptySlot
    | null
    | 0
  )[];
}

interface SanityProject {
  _id?: string;
  _type?: "project";
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

const PROJECTS_QUERY = `*[_type == "project"] | order(order asc, _createdAt desc){
  _id,
  _type,
  ...,
  gallery[]{
    _key,
    layout,
    aspectRatio,
    customAspectRatio,
    images[]{
      ...,
      image{
        ...,
        asset->{
          _id,
          url,
          metadata {
            dimensions,
            lqip
          }
        }
      },
      video{
        asset->{
          _id,
          url,
          mimeType
        }
      },
      poster{
        ...,
        asset->{
          _id,
          url,
          metadata {
            dimensions,
            lqip
          }
        }
      },
      asset->{
        _id,
        url,
        metadata {
          dimensions,
          lqip
        }
      }
    }
  }
}`;

const PROJECT_BY_SLUG_QUERY = `*[_type == "project" && slug.current == $slug][0]{
  _id,
  _type,
  ...,
  gallery[]{
    _key,
    layout,
    aspectRatio,
    customAspectRatio,
    images[]{
      ...,
      image{
        ...,
        asset->{
          _id,
          url,
          metadata {
            dimensions,
            lqip
          }
        }
      },
      video{
        asset->{
          _id,
          url,
          mimeType
        }
      },
      poster{
        ...,
        asset->{
          _id,
          url,
          metadata {
            dimensions,
            lqip
          }
        }
      },
      asset->{
        _id,
        url,
        metadata {
          dimensions,
          lqip
        }
      }
    }
  }
}`;

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

  return stegaClean(urlForImage(image).url());
}

function getSanityFileUrl(file?: SanityGalleryVideo["video"]): string {
  const asset = file?.asset;

  if (!asset?._ref && !asset?._id && !asset?.url) {
    return "";
  }

  return stegaClean(asset.url || "");
}

function createProjectEdit(project: SanityProject, path: string) {
  if (!project._id || !project._type || !path) {
    return undefined;
  }

  return createDataAttribute({
    baseUrl: "/studio",
    dataset,
    id: project._id,
    path,
    projectId,
    type: project._type,
  }).toString();
}

function isGalleryImageWithRatio(
  item: SanityGalleryImage | SanityGalleryImageWithRatio | SanityGalleryVideo | SanityGalleryEmptySlot
): item is SanityGalleryImageWithRatio {
  return "_type" in item && item._type === "galleryImage";
}

function isGalleryVideo(
  item: SanityGalleryImage | SanityGalleryImageWithRatio | SanityGalleryVideo | SanityGalleryEmptySlot
): item is SanityGalleryVideo {
  return "_type" in item && item._type === "galleryVideo";
}

function isGalleryEmptySlot(
  item: SanityGalleryImage | SanityGalleryImageWithRatio | SanityGalleryVideo | SanityGalleryEmptySlot
): item is SanityGalleryEmptySlot {
  return "_type" in item && item._type === "galleryEmptySlot";
}

function normalizeAspectRatio(aspectRatio?: string) {
  const trimmed = stegaClean(aspectRatio || "").trim();

  if (!trimmed || trimmed === "auto" || trimmed === "custom") {
    return undefined;
  }

  return trimmed;
}

function resolveAspectRatio(
  itemAspectRatio?: string,
  itemCustomAspectRatio?: string,
  blockAspectRatio?: string,
  blockCustomAspectRatio?: string
) {
  return (
    normalizeAspectRatio(itemCustomAspectRatio) ||
    normalizeAspectRatio(itemAspectRatio) ||
    normalizeAspectRatio(blockCustomAspectRatio) ||
    normalizeAspectRatio(blockAspectRatio)
  );
}

function getGalleryImageSource(
  item:
    | SanityGalleryImage
    | SanityGalleryImageWithRatio
    | SanityGalleryVideo
    | SanityGalleryEmptySlot
    | null
    | 0
): {
  image?: SanityGalleryImage;
  aspectRatio?: GalleryAspectRatio;
  customAspectRatio?: string;
  customWidthPx?: number;
  customHeightPx?: number;
  objectPositionX?: number;
  objectPositionY?: number;
} {
  if (!item) {
    return {};
  }

  if (isGalleryEmptySlot(item)) {
    return {};
  }

  if (isGalleryVideo(item)) {
    return {};
  }

  if (isGalleryImageWithRatio(item)) {
    return {
      image: item.image,
      aspectRatio: item.aspectRatio,
      customAspectRatio: item.customAspectRatio,
      customWidthPx: item.customWidthPx,
      customHeightPx: item.customHeightPx,
      objectPositionX: item.objectPositionX,
      objectPositionY: item.objectPositionY,
    };
  }

  return { image: item };
}

function mapGalleryImage(
  item:
    | SanityGalleryImage
    | SanityGalleryImageWithRatio
    | SanityGalleryVideo
    | SanityGalleryEmptySlot
    | null
    | 0,
  blockAspectRatio?: GalleryAspectRatio,
  blockCustomAspectRatio?: string,
  edit?: string
): GalleryMediaSlot {
  if (item && isGalleryVideo(item)) {
    const src = getSanityFileUrl(item.video);

    if (!src) {
      return null;
    }

    return {
      kind: "video",
      src,
      edit,
      poster: getSanityImageUrl(item.poster) || undefined,
      mimeType: item.video?.asset?.mimeType,
      aspectRatio: resolveAspectRatio(
        item.aspectRatio,
        item.customAspectRatio,
        blockAspectRatio,
        blockCustomAspectRatio
      ),
    };
  }

  const {
    image,
    aspectRatio,
    customAspectRatio,
    customWidthPx,
    customHeightPx,
    objectPositionX,
    objectPositionY,
  } =
    getGalleryImageSource(item);
  const src = getSanityImageUrl(image);

  if (!src || !image) {
    return null;
  }

  const dimensions = image.asset?.metadata?.dimensions;

  return {
    kind: "image",
    src,
    edit,
    orientation: getImageOrientation(image),
    aspectRatio: resolveAspectRatio(
      aspectRatio,
      customAspectRatio,
      blockAspectRatio,
      blockCustomAspectRatio
    ),
    customWidthPx,
    customHeightPx,
    objectPositionX,
    objectPositionY,
    width: dimensions?.width,
    height: dimensions?.height,
    lqip: image.asset?.metadata?.lqip,
  };
}

function mapSanityProject(p: SanityProject): Project | undefined {
  const slug = stegaClean(p.slug?.current || "");

  if (!slug || !p.title) {
    return undefined;
  }

  return {
    titleEdit: createProjectEdit(p, "title"),
    descriptionEdit: createProjectEdit(p, "description"),
    scopeEdit: createProjectEdit(p, "scope"),
    actionsEdit: createProjectEdit(p, "actions"),
    yearEdit: createProjectEdit(p, "year"),
    slug,
    title: p.title,
    year: p.year || "",
    folderColor: stegaClean(p.folderColor || "") || "#dddddd",
    thumbnail: getSanityImageUrl(p.thumbnail),
    description: p.description || "",
    scope: p.scope || "",
    actions: p.actions || "",
    gallery: p.gallery
      ? p.gallery.map((g, blockIndex) => ({
          edit: createProjectEdit(
            p,
            g._key ? `gallery[_key=="${g._key}"]` : `gallery[${blockIndex}]`
          ),
          layout: (stegaClean(g.layout || "") as GalleryLayout) || "full",
          images: g.images
            ? g.images.map((image, imageIndex) => {
                const imageKey =
                  image && typeof image === "object" && "_key" in image ? image._key : undefined;
                const blockPath = g._key ? `gallery[_key=="${g._key}"]` : `gallery[${blockIndex}]`;
                const imagePath = imageKey
                  ? `${blockPath}.images[_key=="${imageKey}"]`
                  : `${blockPath}.images[${imageIndex}]`;

                return mapGalleryImage(
                  image,
                  g.aspectRatio,
                  g.customAspectRatio,
                  createProjectEdit(
                    p,
                    image && typeof image === "object" && "_type" in image && image._type === "galleryImage"
                      ? `${imagePath}.image`
                      : image && typeof image === "object" && "_type" in image && image._type === "galleryVideo"
                        ? `${imagePath}.video`
                        : imagePath
                  )
                );
              })
            : []
        })).filter((g) => g.images.some(Boolean))
      : []
  };
}

export async function getProjects(preview = false): Promise<Project[]> {
  try {
    const { data: sanityProjects } = await sanityFetch({
      query: PROJECTS_QUERY,
      perspective: preview ? undefined : "published",
      stega: preview ? undefined : false,
      tags: ["project"],
    });

    const projects = sanityProjects as SanityProject[] | null;

    if (projects && projects.length > 0) {
      const mappedProjects = projects
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
    const { data: p } = await sanityFetch({
      query: PROJECT_BY_SLUG_QUERY,
      params: { slug },
      perspective: preview ? undefined : "published",
      stega: preview ? undefined : false,
      tags: [`project:${slug}`, "project"],
    });

    if (p) {
      const project = mapSanityProject(p as SanityProject);

      if (project) {
        return project;
      }
    }
  } catch (error) {
    console.error("Error fetching project from Sanity:", error);
  }
  
  return hardcodedProjects.find((p) => p.slug === slug);
}
