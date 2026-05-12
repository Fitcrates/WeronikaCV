import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/projects";

/* ============================================
   FolderCard — Uses the exact Union.svg shape
   as the folder. Thumbnail sits BEHIND the
   folder (lower z-index) and slides up on hover.
   ============================================ */

interface FolderCardProps {
  project: Project;
}

export default function FolderCard({ project }: FolderCardProps) {
  return (
    <Link href={`/projekt/${project.slug}`} className="folder-card">
      {/* Thumbnail BEHIND the folder — lower z-index, peeks from top */}
      <div className="folder-card__thumbnail-wrap">
        <Image
          src={project.thumbnail}
          alt={project.title}
          width={400}
          height={300}
          className="folder-card__thumbnail"
        />
      </div>

      {/* Folder shape — uses Union.svg rendered inline as SVG */}
      <div className="folder-card__shape">
        <svg
          viewBox="0 0 640 533"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="folder-card__svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M299.398 48.2649C303.195 52.9607 308.911 55.6895 314.95 55.6895H619.892C630.937 55.6895 639.892 64.6438 639.892 75.6895V512.393C639.892 523.438 630.937 532.393 619.892 532.393H20C8.95435 532.393 0 523.438 0 512.393V20C0 8.9543 8.9543 0 20 0H250.822C256.861 0 262.577 2.72871 266.374 7.42459L299.398 48.2649Z"
            fill={project.folderColor}
          />
        </svg>
      </div>

      {/* Name + Arrow — on top of folder */}
      <span className="folder-card__name">{project.title}</span>
      <span className="folder-card__arrow">→</span>
    </Link>
  );
}
