import { getTranslations } from "next-intl/server";
import { AchievementRing, type AchievementGroup } from "@/components/sections/achievement-ring";

/**
 * Achievements on a rotating wheel of cards: the figure first (counting up as it scrolls into view),
 * one line saying what was done, the short story under it.
 */
export async function Achievements() {
  const aboutTexts = await getTranslations("about");
  const groups = aboutTexts.raw("impact.items") as AchievementGroup[];

  const labels = {
    label: aboutTexts("impact.ring.label"),
    previous: aboutTexts("impact.ring.previous"),
    next: aboutTexts("impact.ring.next"),
    position: aboutTexts("impact.ring.position", { current: "{current}", total: "{total}" }),
  };

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <h2 className="font-display text-3xl font-medium tracking-tight text-signal">{aboutTexts("impact.title")}</h2>
      <p className="mt-3 max-w-xl text-muted-foreground">{aboutTexts("impact.intro")}</p>

      <div className="mt-8">
        <AchievementRing groups={groups} labels={labels} />
      </div>
    </section>
  );
}
