import { getProjects } from "@/lib/projects";
import FolderCard from "./FolderCard";

interface ProjectGridProps {
  title: string;
  preview?: boolean;
}

export default async function ProjectGrid({ title, preview = false }: ProjectGridProps) {
  const projects = await getProjects(preview);

  return (
    <section id="projekty" className="projects-section">
      <div className="container">
        <h2 className="projects-section__title">{title}</h2>
        <div className="projects-grid animate-fade-in-delay-3">
          {projects.map((project) => (
            <FolderCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
