import { getTranslations } from "next-intl/server";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

type EducationItem = { title: string; institution: string; date: string };
type LanguageItem = { language: string; level: string };

export default async function AboutPage() {
  const aboutTexts = await getTranslations("about");
  const educationItems = aboutTexts.raw("educationItems") as EducationItem[];
  const languageItems = aboutTexts.raw("languageItems") as LanguageItem[];

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <Reveal>
        <h1 className="font-display text-4xl font-medium tracking-tight">{aboutTexts("title")}</h1>
        <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">{aboutTexts("body")}</p>
      </Reveal>

      <Reveal>
        <h2 className="mt-14 font-display text-2xl font-medium">{aboutTexts("education")}</h2>
      </Reveal>
      <RevealGroup as="ul" className="mt-5 divide-y divide-border border-t border-border">
        {educationItems.map((item) => (
          <RevealItem
            as="li"
            key={item.title}
            className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-baseline sm:justify-between"
          >
            <span>
              {item.title}{" "}
              <span className="text-muted-foreground">({item.institution})</span>
            </span>
            <span className="font-data text-xs text-muted-foreground">{item.date}</span>
          </RevealItem>
        ))}
      </RevealGroup>

      <Reveal>
        <h2 className="mt-14 font-display text-2xl font-medium">{aboutTexts("languages")}</h2>
      </Reveal>
      <RevealGroup as="ul" className="mt-5 divide-y divide-border border-t border-border">
        {languageItems.map((item) => (
          <RevealItem as="li" key={item.language} className="flex justify-between py-3 text-sm">
            <span>{item.language}</span>
            <span className="text-muted-foreground">{item.level}</span>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
