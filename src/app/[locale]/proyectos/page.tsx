import { getTranslations } from "next-intl/server";
import { FaScrewdriverWrench } from "react-icons/fa6";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { WaveCard } from "@/components/ui/wave-card";
import { Reveal } from "@/components/motion/reveal";

/**
 * Case studies are still being written, so the listing is replaced by an "in progress" notice.
 * To publish them again, render `getAllProjectsMeta(locale)` with `ProjectCard` here
 * (the MDX files and the `[slug]` route are untouched).
 */
export default async function ProjectsPage() {
  const projectsTexts = await getTranslations("projects");

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <Reveal>
        <h1 className="font-display text-4xl font-medium tracking-tight text-signal sm:text-5xl">
          {projectsTexts("title")}
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">{projectsTexts("subtitle")}</p>
      </Reveal>

      <Reveal className="mt-10" delay={0.1}>
        <WaveCard>
          <div
            role="status"
            className="mx-auto flex max-w-2xl flex-col items-center gap-5 py-6 text-center"
          >
            <span className="flex size-14 items-center justify-center rounded-full border border-signal text-signal">
              <FaScrewdriverWrench aria-hidden className="size-6" />
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-data text-xs text-signal">
              <span aria-hidden className="size-2 animate-pulse rounded-full bg-signal" />
              {projectsTexts("inProgress.badge")}
            </span>
            <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
              {projectsTexts("inProgress.title")}
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {projectsTexts("inProgress.body")}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-1">
              <Button className="rounded-sm" nativeButton={false} render={<Link href="/sobre-mi" />}>
                {projectsTexts("inProgress.aboutCta")}
              </Button>
              <Button
                className="rounded-sm"
                variant="outline"
                nativeButton={false}
                render={<Link href="/contacto" />}
              >
                {projectsTexts("inProgress.contactCta")}
              </Button>
            </div>
          </div>
        </WaveCard>
      </Reveal>
    </section>
  );
}
