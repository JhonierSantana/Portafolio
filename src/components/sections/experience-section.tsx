import { getLocale, getTranslations } from "next-intl/server";
import { ExperienceScroller, type ExperienceView } from "@/components/sections/experience-scroller";
import { experienceDates, monthsWorked, professionalMonths, splitMonths, toDate, yearOf } from "@/lib/experience";

type ExperienceMessage = {
  id: string;
  role: string;
  company: string;
  location: string;
  points: string[];
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * Experience as a scroll story. Dates live in lib/experience.ts, text in messages; durations
 * are computed here (on the server) so they are always current and identical on both renders.
 */
export async function ExperienceSection() {
  const [experienceTexts, locale] = await Promise.all([getTranslations("experience"), getLocale()]);
  const messages = experienceTexts.raw("items") as ExperienceMessage[];
  const monthFormat = new Intl.DateTimeFormat(locale, { month: "short", year: "numeric", timeZone: "UTC" });

  const formatDuration = (totalMonths: number) => {
    const { years, months } = splitMonths(totalMonths);
    return [years && experienceTexts("years", { count: years }), months && experienceTexts("months", { count: months })]
      .filter(Boolean)
      .join(experienceTexts("and"));
  };

  const items: ExperienceView[] = experienceDates.map((dates) => {
    const message = messages.find((item) => item.id === dates.id);
    if (!message) throw new Error(`Missing experience text for "${dates.id}" in messages/${locale}.json`);
    const start = capitalize(monthFormat.format(toDate(dates.start)));
    const end = dates.end ? capitalize(monthFormat.format(toDate(dates.end))) : experienceTexts("present");
    return {
      ...message,
      year: yearOf(dates.start),
      period: `${start} – ${end}`,
      duration: formatDuration(monthsWorked(dates)),
      jumpLabel: experienceTexts("jump", { role: message.role, company: message.company, year: yearOf(dates.start) }),
    };
  });

  return (
    <ExperienceScroller
      title={experienceTexts("title")}
      intro={experienceTexts("intro")}
      total={{ value: formatDuration(professionalMonths(experienceDates)), label: experienceTexts("total") }}
      items={items}
    />
  );
}
