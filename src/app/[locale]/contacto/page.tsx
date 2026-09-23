import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/sections/contact-form";
import { Reveal } from "@/components/motion/reveal";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("contact");

  return (
    <section className="mx-auto max-w-xl px-6 py-16">
      <Reveal>
        <h1 className="font-display text-4xl font-medium tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        <ContactForm />
      </Reveal>
    </section>
  );
}
