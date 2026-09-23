import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllProjectsMeta } from "@/lib/projects";
import { ProjectCard } from "@/components/sections/project-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("projects");
  const projects = await getAllProjectsMeta(locale);

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <Reveal>
        <h1 className="font-display text-4xl font-medium tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </Reveal>
      <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <RevealItem key={project.slug}>
            <ProjectCard project={project} />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
