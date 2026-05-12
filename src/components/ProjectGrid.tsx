import { getProjects } from "@/lib/projects";
import FolderCard from "./FolderCard";

interface ProjectGridProps {
  title: string;
}

export default async function ProjectGrid({ title }: ProjectGridProps) {
  const projects = await getProjects();

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
