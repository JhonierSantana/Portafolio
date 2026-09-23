import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getProjectContent, getProjectSlugs } from "@/lib/projects";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getProjectSlugs(locale).map((slug) => ({ locale, slug })),
  );
}

export default async function ProjectCasePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  let Content: React.ComponentType;
  let metadata;
  try {
    ({ Content, metadata } = await getProjectContent(locale, slug));
  } catch {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-data text-xs text-muted-foreground">{metadata.period}</p>
      <h1 className="mt-2 font-display text-4xl font-medium tracking-tight">
        {metadata.title}
      </h1>
      <p className="mt-1 text-muted-foreground">{metadata.role}</p>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-3 font-data text-xs text-muted-foreground">
        {metadata.stack.map((tech) => (
          <span key={tech}>{tech}</span>
        ))}
      </div>
      <div className="prose prose-invert prose-headings:font-display prose-headings:font-medium prose-headings:tracking-tight prose-a:text-signal mt-10 max-w-none prose-p:text-muted-foreground prose-li:text-muted-foreground">
        <Content />
      </div>
    </article>
  );
}
