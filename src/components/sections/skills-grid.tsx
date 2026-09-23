import { useTranslations } from "next-intl";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { WaveCard } from "@/components/ui/wave-card";
import { IconMarquee } from "@/components/ui/icon-marquee";
import { techIcons } from "@/lib/tech-icons";

type SkillGroup = {
  label: string;
  items: string[];
};

export function SkillsGrid() {
  const t = useTranslations("skills");
  const groups = t.raw("groups") as SkillGroup[];

  return (
    <section className="py-16">
      <WaveCard bleed>
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="font-display text-3xl font-medium tracking-tight">{t("title")}</h2>
          </Reveal>
          <RevealGroup className="mt-10 space-y-10">
            {groups.map((group, index) => {
              const techItems = group.items.filter((item) => item in techIcons);
              const staticItems = group.items.filter((item) => !(item in techIcons));

              return (
                <RevealItem key={group.label} className="border-t border-border pt-5">
                  <h3 className="font-data text-xs text-muted-foreground">{group.label}</h3>

                  {techItems.length > 0 && (
                    <div className="mt-4">
                      <IconMarquee
                        names={techItems}
                        direction={index % 2 === 0 ? "left" : "right"}
                      />
                    </div>
                  )}

                  {staticItems.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
                      {staticItems.map((item) => (
                        <span key={item} className="font-medium text-signal">
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </WaveCard>
    </section>
  );
}
