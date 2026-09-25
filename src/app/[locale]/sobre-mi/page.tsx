import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { WaveCard } from "@/components/ui/wave-card";
import { techIcons } from "@/lib/tech-icons";

type Stat = { value: string; label: string };
type ImpactPoint = { lead: string; text: string };
type ImpactItem = { role: string; company: string; period: string; points: ImpactPoint[] };
type EducationItem = { title: string; institution: string; date: string };
type LanguageItem = { language: string; level: string };

const CORE_STACK = ["React.js", "React Native", "Electron.js", "Node.js", "TypeScript", "JavaScript (ES6+)"];

const emphasize = {
  strong: (chunks: ReactNode) => <strong className="font-medium text-foreground">{chunks}</strong>,
};

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display text-3xl font-medium tracking-tight text-signal">{children}</h2>
  );
}

export default async function AboutPage() {
  const aboutTexts = await getTranslations("about");
  const stats = aboutTexts.raw("stats") as Stat[];
  const impactItems = aboutTexts.raw("impact.items") as ImpactItem[];
  const lessons = aboutTexts.raw("philosophy.lessons") as string[];
  const educationItems = aboutTexts.raw("educationItems") as EducationItem[];
  const languageItems = aboutTexts.raw("languageItems") as LanguageItem[];
  const remainingImpactCount = impactItems.length - 1;

  return (
    <>
      <section className="mx-auto max-w-5xl px-6 pb-6 pt-10">
        <Reveal>
          <h1 className="font-display text-4xl font-medium tracking-tight text-signal sm:text-5xl">
            {aboutTexts("title")}
          </h1>
          <div className="mt-6 max-w-3xl space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>{aboutTexts.rich("introFirst", emphasize)}</p>
            <p>{aboutTexts.rich("introSecond", emphasize)}</p>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-4">
            {CORE_STACK.filter((name) => name in techIcons).map((name) => {
              const Icon = techIcons[name];
              return (
                <li key={name} className="group flex w-16 flex-col items-center gap-1.5 text-center">
                  <Icon
                    aria-hidden
                    className="size-9 text-muted-foreground transition-colors group-hover:text-signal"
                  />
                  <span className="text-[11px] leading-tight text-muted-foreground">{name}</span>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-6">
        <Reveal>
          <WaveCard>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
              {stats.map((stat) => (
                <li key={stat.label}>
                  <p className="font-display text-4xl font-medium text-signal sm:text-5xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm leading-snug text-muted-foreground">{stat.label}</p>
                </li>
              ))}
            </ul>
          </WaveCard>
        </Reveal>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <Reveal>
          <SectionTitle>{aboutTexts("impact.title")}</SectionTitle>
        </Reveal>
        <RevealGroup className="mt-8 grid gap-6 md:grid-cols-2">
          {impactItems.map((item, index) => {
            const isFeatured = index === 0;
            const isLastOdd = index === impactItems.length - 1 && remainingImpactCount % 2 === 1;
            return (
              <RevealItem
                key={`${item.company}-${item.period}`}
                className={isFeatured || isLastOdd ? "md:col-span-2" : undefined}
              >
                <WaveCard>
                  {isFeatured && (
                    <p className="mb-2 font-data text-xs text-signal">{aboutTexts("impact.current")}</p>
                  )}
                  <p className="font-data text-xs text-muted-foreground">{item.period}</p>
                  <h3 className="mt-1.5 text-lg font-medium">{item.role}</h3>
                  <p className="text-sm text-signal">{item.company}</p>
                  <ul
                    className={`mt-4 gap-x-8 gap-y-4 ${
                      isFeatured ? "grid md:grid-cols-3" : "space-y-4"
                    }`}
                  >
                    {item.points.map((point) => (
                      <li key={point.lead} className="text-sm leading-relaxed text-muted-foreground">
                        <span className="block font-medium text-foreground">{point.lead}</span>
                        {point.text}
                      </li>
                    ))}
                  </ul>
                </WaveCard>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </section>

      <section className="py-10">
        <WaveCard bleed>
          <div className="mx-auto max-w-3xl px-6">
            <Reveal>
              <SectionTitle>{aboutTexts("philosophy.title")}</SectionTitle>
              <div className="mt-6 space-y-4 leading-relaxed text-muted-foreground">
                <p>{aboutTexts.rich("philosophy.first", emphasize)}</p>
                <p>{aboutTexts.rich("philosophy.second", emphasize)}</p>
                <p>{aboutTexts.rich("philosophy.third", emphasize)}</p>
              </div>
            </Reveal>
            <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2">
              {lessons.map((lesson) => (
                <RevealItem key={lesson}>
                  <blockquote className="border-l-2 border-signal pl-4 font-display text-xl leading-snug">
                    {lesson}
                  </blockquote>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </WaveCard>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16 pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal>
            <WaveCard className="h-full">
              <h2 className="font-display text-2xl font-medium text-signal">
                {aboutTexts("education")}
              </h2>
              <ul className="mt-4 space-y-4">
                {educationItems.map((item) => (
                  <li key={item.title} className="text-sm">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-muted-foreground">{item.institution}</p>
                    <p className="mt-0.5 font-data text-xs text-muted-foreground">{item.date}</p>
                  </li>
                ))}
              </ul>
            </WaveCard>
          </Reveal>
          <Reveal delay={0.15}>
            <WaveCard className="h-full">
              <h2 className="font-display text-2xl font-medium text-signal">
                {aboutTexts("languages")}
              </h2>
              <ul className="mt-4 space-y-4">
                {languageItems.map((item) => (
                  <li key={item.language} className="flex items-baseline justify-between text-sm">
                    <span className="font-medium">{item.language}</span>
                    <span className="text-muted-foreground">{item.level}</span>
                  </li>
                ))}
              </ul>
            </WaveCard>
          </Reveal>
        </div>
      </section>
    </>
  );
}
