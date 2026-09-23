import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/hero";
import { ExperienceTimeline } from "@/components/sections/experience-timeline";
import { SkillsGrid } from "@/components/sections/skills-grid";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <ExperienceTimeline />
      <SkillsGrid />
    </>
  );
}
