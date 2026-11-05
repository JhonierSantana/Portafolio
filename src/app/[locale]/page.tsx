import { Hero } from "@/components/sections/hero";
import { ExperienceTimeline } from "@/components/sections/experience-timeline";
import { SkillsGrid } from "@/components/sections/skills-grid";
import { GithubLog } from "@/components/sections/github-log";

export default async function Home() {
  return (
    <>
      <Hero />
      <ExperienceTimeline />
      <SkillsGrid />
      <GithubLog />
    </>
  );
}
