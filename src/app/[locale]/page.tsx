import { Hero } from "@/components/sections/hero";
import { ExperienceSection } from "@/components/sections/experience-section";
import { SkillsGrid } from "@/components/sections/skills-grid";
import { GithubLog } from "@/components/sections/github-log";

export default async function Home() {
  return (
    <>
      <Hero />
      <ExperienceSection />
      <SkillsGrid />
      <GithubLog />
    </>
  );
}
