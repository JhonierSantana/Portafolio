import { useTranslations } from "next-intl";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { WaveCard } from "@/components/ui/wave-card";
import { IconMarquee } from "@/components/ui/icon-marquee";
import { techIcons } from "@/lib/tech-icons";

type SkillGroup = {
  label: string;
  items: string[];
};

const withIcon = (items: string[]) => items.filter((item) => item in techIcons);

function CardTitle({ children }: { children: string }) {
  return <h3 className="font-data text-sm text-signal">{children}</h3>;
}

function IconRow({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3">
      {withIcon(items).map((item) => {
        const Icon = techIcons[item];
        return (
          <li key={item} className="group flex w-16 flex-col items-center gap-1.5 text-center">
            <Icon
              aria-hidden
              className="size-9 text-muted-foreground transition-colors group-hover:text-signal"
            />
            <span className="text-[11px] leading-tight text-muted-foreground">{item}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function SkillsGrid() {
  const skillsTexts = useTranslations("skills");
  // Order in messages/*.json: frontend, state, backend, testing, tools.
  const [frontend, state, backend, testing, tools] = skillsTexts.raw("groups") as SkillGroup[];

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <Reveal>
        <h2 className="font-display text-3xl font-medium tracking-tight text-signal">
          {skillsTexts("title")}
        </h2>
      </Reveal>
      <RevealGroup className="mt-6 grid gap-4 sm:grid-cols-2">
        <RevealItem className="sm:col-span-2">
          <WaveCard className="py-2!">
            <CardTitle>{skillsTexts("frontBackTitle")}</CardTitle>
            <div className="mt-3">
              <IconMarquee names={withIcon([...frontend.items, ...backend.items])} />
            </div>
          </WaveCard>
        </RevealItem>
        <RevealItem>
          <WaveCard className="py-2!">
            <CardTitle>{skillsTexts("stateQaTitle")}</CardTitle>
            <IconRow items={[...state.items, ...testing.items]} />
          </WaveCard>
        </RevealItem>
        <RevealItem>
          <WaveCard className="py-2!">
            <CardTitle>{tools.label}</CardTitle>
            <IconRow items={tools.items} />
          </WaveCard>
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
