import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/reveal";
import { WaveCard } from "@/components/ui/wave-card";
import { slideInLeft, slideInRight } from "@/lib/motion";

type ExperienceItem = {
  role: string;
  company: string;
  location: string;
  period: string;
  points: string[];
};

export function ExperienceTimeline() {
  const experienceTexts = useTranslations("experience");
  const items = experienceTexts.raw("items") as ExperienceItem[];

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <Reveal>
        <h2 className="font-display text-3xl font-medium tracking-tight text-signal">{experienceTexts("title")}</h2>
      </Reveal>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {items.map((item, index) => (
          <Reveal
            key={`${item.company}-${item.period}`}
            variants={index % 2 === 0 ? slideInLeft : slideInRight}
            delay={Math.floor(index / 2) * 0.15}
          >
            <WaveCard>
              {index === 0 && (
                <p className="mb-2 font-data text-xs text-signal">{experienceTexts("current")}</p>
              )}
              <p className="font-data text-xs text-muted-foreground">{item.period}</p>
              <h3 className="mt-1.5 text-lg font-medium">{item.role}</h3>
              <p className="text-sm text-muted-foreground">
                {item.company}, {item.location}
              </p>
              <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                {item.points.map((point) => (
                  <li key={point} className="flex gap-2.5">
                    <span className="mt-2 h-px w-3 shrink-0 bg-border" aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </WaveCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
