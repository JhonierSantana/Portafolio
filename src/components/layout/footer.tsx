import { useTranslations } from "next-intl";
import { FaEnvelope, FaGithub, FaLinkedin } from "react-icons/fa6";
import { Link } from "@/i18n/navigation";
import { WaveDivider } from "@/components/ui/wave-divider";
import { contactInfo } from "@/lib/contact-info";

const socials = [
  { label: "Email", href: `mailto:${contactInfo.email}`, Icon: FaEnvelope, external: false },
  { label: "GitHub", href: contactInfo.githubUrl, Icon: FaGithub, external: true },
  {
    label: "LinkedIn",
    href: contactInfo.linkedinUrl,
    Icon: FaLinkedin,
    external: true,
  },
];

const links = [
  { href: "/", key: "home" },
  { href: "/sobre-mi", key: "about" },
  { href: "/proyectos", key: "projects" },
  { href: "/contacto", key: "contact" },
] as const;

export function Footer() {
  const footerTexts = useTranslations("footer");
  const navTexts = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8">
      <WaveDivider animated size="h-8 sm:h-12" />
      <div className="bg-card">
        <div className="mx-auto max-w-5xl px-6 pb-8 pt-4">
          <div className="grid gap-10 sm:grid-cols-[1.6fr_1fr]">
            <div>
              <p className="font-display text-3xl font-medium leading-tight tracking-tight text-signal sm:text-4xl">
                {footerTexts("cta")}
              </p>
              <a
                href={`mailto:${contactInfo.email}`}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-signal-foreground transition-transform hover:-translate-y-0.5"
              >
                <FaEnvelope aria-hidden className="size-4" />
                {footerTexts("email")}
              </a>
            </div>
            <nav aria-label="Footer" className="sm:justify-self-end">
              <ul className="space-y-1">
                {links.map(({ href, key }) => (
                  <li key={key}>
                    <Link
                      href={href}
                      className="inline-block py-1 text-sm text-muted-foreground transition-colors hover:text-signal"
                    >
                      {navTexts(key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-10 flex flex-col-reverse items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {year} Jhonier Santana. {footerTexts("rights")}
            </p>
            <ul className="flex gap-3">
              {socials.map(({ label, href, Icon, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    title={label}
                    {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-signal hover:text-signal"
                  >
                    <Icon aria-hidden className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
