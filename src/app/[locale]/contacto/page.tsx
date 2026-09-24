import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/sections/contact-form";
import { Reveal } from "@/components/motion/reveal";

export default async function ContactPage() {
  const contactTexts = await getTranslations("contact");

  return (
    <section className="mx-auto max-w-xl px-6 py-16">
      <Reveal>
        <h1 className="font-display text-4xl font-medium tracking-tight">{contactTexts("title")}</h1>
        <p className="mt-2 text-muted-foreground">{contactTexts("subtitle")}</p>
        <ContactForm />
      </Reveal>
    </section>
  );
}
