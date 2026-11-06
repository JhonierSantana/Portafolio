import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import type { CityId } from "@/lib/route";
import { RouteMap } from "@/components/sections/route-map";
import { AvatarRing } from "@/components/sections/avatar-ring";
import { WaveCard } from "@/components/ui/wave-card";

type Stat = { value: string; label: string };
type ImpactPoint = { lead: string; text: string };
type ImpactItem = { role: string; company: string; period: string; points: ImpactPoint[] };
type RouteStopText = { id: string; label: string; detail: string };
type EducationItem = { title: string; institution: string; date: string };
type LanguageItem = { language: string; level: string };

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
  const routeStops = aboutTexts.raw("route.stops") as RouteStopText[];
  const cityNames = aboutTexts.raw("route.cities") as Record<CityId, string>;

  return (
    <>
      <section className="mx-auto max-w-5xl px-6 pb-6 pt-10">
        <div className="grid items-center gap-12 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16">
          <div>
            <h1 className="font-display text-4xl font-medium tracking-tight text-signal sm:text-5xl">
              {aboutTexts("title")}
            </h1>
            <div className="mt-6 max-w-2xl space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>{aboutTexts.rich("introFirst", emphasize)}</p>
              <p>{aboutTexts.rich("introSecond", emphasize)}</p>
            </div>
          </div>
          <div className="flex justify-center md:pr-4">
            <AvatarRing size="size-48 sm:size-56 md:size-64" imgSize={256} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-6">
        <div>
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
        </div>
      </section>

      <RouteMap
        title={aboutTexts("route.title")}
        intro={aboutTexts("route.intro")}
        cityNames={cityNames}
        stops={routeStops}
      />

      <section className="mx-auto max-w-5xl px-6 py-10">
        <SectionTitle>{aboutTexts("impact.title")}</SectionTitle>
        <div className="mt-8">
          <WaveCard>
            <ul className="grid gap-x-12 gap-y-8 md:grid-cols-2">
              {impactItems.map((item) => (
                <li key={`${item.company}-${item.period}`}>
                  <p className="font-data text-xs text-muted-foreground">{item.period}</p>
                  <h3 className="mt-1 text-lg font-medium">{item.role}</h3>
                  <p className="text-sm text-signal">{item.company}</p>
                  <ul className="mt-3 space-y-3">
                    {item.points.map((point) => (
                      <li key={point.lead} className="text-sm leading-relaxed text-muted-foreground">
                        <span className="font-medium text-foreground">{point.lead}. </span>
                        {point.text}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </WaveCard>
        </div>
      </section>

      <section className="py-10">
        <WaveCard bleed>
          <div className="mx-auto max-w-3xl px-6">
            <div>
              <SectionTitle>{aboutTexts("philosophy.title")}</SectionTitle>
              <div className="mt-6 space-y-4 leading-relaxed text-muted-foreground">
                <p>{aboutTexts.rich("philosophy.first", emphasize)}</p>
                <p>{aboutTexts.rich("philosophy.second", emphasize)}</p>
                <p>{aboutTexts.rich("philosophy.third", emphasize)}</p>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {lessons.map((lesson) => (
                <div key={lesson}>
                  <blockquote className="border-l-2 border-signal pl-4 font-display text-xl leading-snug">
                    {lesson}
                  </blockquote>
                </div>
              ))}
            </div>
          </div>
        </WaveCard>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16 pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
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
          </div>
          <div>
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
          </div>
        </div>
      </section>
    </>
  );
}
