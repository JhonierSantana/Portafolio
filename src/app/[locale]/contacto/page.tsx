import type { ComponentType } from "react";
import { getTranslations } from "next-intl/server";
import { FaEnvelope, FaGithub, FaLinkedin, FaLocationDot, FaPhone } from "react-icons/fa6";
import { ContactForm } from "@/components/sections/contact-form";
import { Reveal } from "@/components/motion/reveal";
import { WaveCard } from "@/components/ui/wave-card";
import { contactInfo } from "@/lib/contact-info";

type ContactChannel = {
  label: string;
  value: string;
  href?: string;
  Icon: ComponentType<{ className?: string }>;
};

const iconBadgeClass =
  "flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors group-hover:border-signal group-hover:text-signal";

export default async function ContactPage() {
  const contactTexts = await getTranslations("contact");

  const channels: ContactChannel[] = [
    { label: "Email", value: contactInfo.email, href: `mailto:${contactInfo.email}`, Icon: FaEnvelope },
    {
      label: contactTexts("phoneLabel"),
      value: contactInfo.phone,
      href: contactInfo.phoneHref,
      Icon: FaPhone,
    },
    { label: contactTexts("locationLabel"), value: contactInfo.location, Icon: FaLocationDot },
  ];
  const socials = [
    { label: "GitHub", href: contactInfo.githubUrl, Icon: FaGithub },
    { label: "LinkedIn", href: contactInfo.linkedinUrl, Icon: FaLinkedin },
  ];

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <Reveal>
        <h1 className="font-display text-4xl font-medium tracking-tight text-signal sm:text-5xl">
          {contactTexts("title")}
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">{contactTexts("subtitle")}</p>
      </Reveal>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Reveal delay={0.1}>
          <WaveCard className="h-full">
            <h2 className="font-display text-2xl font-medium text-signal">
              {contactTexts("infoTitle")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {contactTexts("infoBody")}
            </p>

            <ul className="mt-6 space-y-4">
              {channels.map(({ label, value, href, Icon }) => {
                const content = (
                  <>
                    <span className={iconBadgeClass}>
                      <Icon aria-hidden className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-data text-xs text-muted-foreground">{label}</span>
                      <span className="block truncate text-sm">{value}</span>
                    </span>
                  </>
                );
                return (
                  <li key={label}>
                    {href ? (
                      <a href={href} className="group flex items-center gap-3">
                        {content}
                      </a>
                    ) : (
                      <div className="group flex items-center gap-3">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 border-t border-border pt-5">
              <p className="font-data text-xs text-muted-foreground">{contactTexts("socialLabel")}</p>
              <ul className="mt-3 flex gap-3">
                {socials.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      title={label}
                      className="group flex"
                    >
                      <span className={iconBadgeClass}>
                        <Icon aria-hidden className="size-4" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </WaveCard>
        </Reveal>

        <Reveal delay={0.2}>
          <WaveCard className="h-full">
            <h2 className="font-display text-2xl font-medium text-signal">
              {contactTexts("formTitle")}
            </h2>
            <ContactForm />
          </WaveCard>
        </Reveal>
      </div>
    </section>
  );
}
