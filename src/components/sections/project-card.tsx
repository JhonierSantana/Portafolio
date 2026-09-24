import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ProjectMeta } from "@/types/project";

export function ProjectCard({ project }: { project: ProjectMeta }) {
  const projectsTexts = useTranslations("projects");

  return (
    <Link
      href={`/proyectos/${project.slug}`}
      className="group relative block border border-border p-6 transition-colors hover:border-signal/60"
    >
      <span className="absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-signal opacity-0 transition-opacity group-hover:opacity-100" />
      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-signal opacity-0 transition-opacity group-hover:opacity-100" />
      <p className="font-data text-xs text-muted-foreground">{project.period}</p>
      <h3 className="mt-2 font-display text-xl font-medium">{project.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {project.summary}
      </p>
      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-data text-xs text-muted-foreground">
        {project.stack.map((tech) => (
          <span key={tech}>{tech}</span>
        ))}
      </div>
      <span className="mt-4 inline-block text-sm font-medium group-hover:text-signal">
        {projectsTexts("viewCase")}
      </span>
    </Link>
  );
}
