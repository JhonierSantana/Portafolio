import type { ProjectMeta } from "@/types/project";

type ProjectModule = {
  default: React.ComponentType;
  metadata: ProjectMeta;
};

const loadMdx = (importer: () => Promise<unknown>) =>
  importer as () => Promise<ProjectModule>;

const projectLoaders: Record<string, Record<string, () => Promise<ProjectModule>>> = {
  es: {
    "bartik-saas-suite": loadMdx(() => import("@/content/projects/es/bartik-saas-suite.mdx")),
    "attendv-on-demand": loadMdx(() => import("@/content/projects/es/attendv-on-demand.mdx")),
    "holberton-fullstack-projects": loadMdx(() =>
      import("@/content/projects/es/holberton-fullstack-projects.mdx"),
    ),
  },
  en: {
    "bartik-saas-suite": loadMdx(() => import("@/content/projects/en/bartik-saas-suite.mdx")),
    "attendv-on-demand": loadMdx(() => import("@/content/projects/en/attendv-on-demand.mdx")),
    "holberton-fullstack-projects": loadMdx(() =>
      import("@/content/projects/en/holberton-fullstack-projects.mdx"),
    ),
  },
};

export function getProjectSlugs(locale: string): string[] {
  return Object.keys(projectLoaders[locale] ?? {});
}

export async function getProjectContent(locale: string, slug: string) {
  const loader = projectLoaders[locale]?.[slug];
  if (!loader) {
    throw new Error(`Project not found: ${locale}/${slug}`);
  }
  const mod = await loader();
  return {
    Content: mod.default,
    metadata: mod.metadata,
  };
}

export async function getAllProjectsMeta(locale: string): Promise<ProjectMeta[]> {
  const slugs = getProjectSlugs(locale);
  const projects = await Promise.all(
    slugs.map(async (slug) => (await getProjectContent(locale, slug)).metadata),
  );
  return projects;
}
