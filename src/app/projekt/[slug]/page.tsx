import { notFound } from "next/navigation";
import { getProjectBySlug, getProjects } from "@/lib/projects";
import ProjectGallery from "@/components/ProjectGallery";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HoverPrefetchLink from "@/components/HoverPrefetchLink";
import PreviewAwareLink from "@/components/PreviewAwareLink";
import { getSiteSettings } from "@/lib/site";
import { isSanityPreviewRequest } from "@/sanity/preview";

/* Generate static params for all projects */
export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  const settings = await getSiteSettings();
  if (!project) return { title: "Projekt nie znaleziony" };
  return {
    title: `${project.title} | ${settings.title}`,
    description: project.description,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const isPreview = await isSanityPreviewRequest();
  const project = await getProjectBySlug(slug, isPreview);
  const settings = await getSiteSettings(isPreview);

  if (!project) {
    notFound();
  }

  /* Find next project for navigation */
  const projectsList = await getProjects(isPreview);
  const currentIndex = projectsList.findIndex((p) => p.slug === slug);
  const nextProject = projectsList[(currentIndex + 1) % projectsList.length];

  return (
    <>
      <Header contact={settings.contact} />
      <main className="project-page">
        <div className="container">
          {/* Navigation bar */}
          <nav className="project-page__nav">
            <PreviewAwareLink href="/#projekty">← Projekty</PreviewAwareLink>
            <HoverPrefetchLink href={`/projekt/${nextProject.slug}`}>
              Następny projekt →
            </HoverPrefetchLink>
          </nav>

          {/* Title */}
          <h1 className="project-page__title animate-fade-in">
            {project.title}
          </h1>

          {/* Meta info */}
          <div className="project-page__meta animate-fade-in-delay-1">
            <div>
              {project.scope && (
                <>
                  <p className="project-page__meta-label">Zakres</p>
                  <p className="project-page__meta-value">{project.scope}</p>
                </>
              )}
              {project.actions && (
                <>
                  <p className="project-page__meta-label">Działania</p>
                  <p className="project-page__meta-value">{project.actions}</p>
                </>
              )}
              {project.year && (
                <>
                  <p className="project-page__meta-label">Rok</p>
                  <p className="project-page__meta-value">{project.year}</p>
                </>
              )}
            </div>

            <div>
              <p className="project-page__meta-label">O marce</p>
              <p className="project-page__meta-value">{project.description}</p>
            </div>
          </div>

          {/* Gallery */}
          <div className="animate-fade-in-delay-2">
            <ProjectGallery key={project.slug} rows={project.gallery} />
          </div>
          {/* Navigation bar */}
          <nav className="project-page__nav">
            <PreviewAwareLink href="/#projekty">← Projekty</PreviewAwareLink>
            <HoverPrefetchLink href={`/projekt/${nextProject.slug}`}>
              Następny projekt →
            </HoverPrefetchLink>
          </nav>
        </div>
      </main>
      <Footer />
    </>
  );
}
