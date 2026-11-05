import { CloudLightning, Copy, Download, FolderGit2, Home, Languages, Mail, Terminal, User } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa6";
import { useTranslations } from "next-intl";
import type { ComponentType } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSwitchLocale } from "@/hooks/use-switch-locale";
import { ambienceStore } from "@/lib/ambience-store";
import { contactInfo, cvHref } from "@/lib/contact-info";
import { navRoutes } from "@/lib/nav-routes";

export type CommandGroup = "navigate" | "actions" | "fun";

export type Command = {
  id: string;
  group: CommandGroup;
  label: string;
  /** Extra words that should also match the search. */
  keywords?: string;
  Icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  /** Return a message to show it in the palette (which then stays open); return nothing to close it. */
  run: () => string | void | Promise<string | void>;
};

const NAV_ICONS = { home: Home, about: User, projects: FolderGit2, contact: Mail } as const;

function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function useCommands(): Command[] {
  const navTexts = useTranslations("nav");
  const paletteTexts = useTranslations("palette");
  const router = useRouter();
  const { locale, locales, switchLocale } = useSwitchLocale();
  const otherLocale = locales.find((candidate) => candidate !== locale) ?? locales[0];

  return [
    ...navRoutes.map<Command>((route) => ({
      id: `nav-${route.key}`,
      group: "navigate",
      label: navTexts(route.key),
      Icon: NAV_ICONS[route.key],
      run: () => router.push(route.href),
    })),
    {
      id: "cv",
      group: "actions",
      label: paletteTexts("commands.cv"),
      keywords: "cv resume curriculum pdf",
      Icon: Download,
      run: () => {
        const link = document.createElement("a");
        link.href = cvHref(locale);
        link.download = "";
        link.click();
      },
    },
    {
      id: "copy-email",
      group: "actions",
      label: paletteTexts("commands.copyEmail"),
      keywords: `email correo mail ${contactInfo.email}`,
      Icon: Copy,
      run: async () => {
        await navigator.clipboard.writeText(contactInfo.email);
        return paletteTexts("copied", { email: contactInfo.email });
      },
    },
    { id: "github", group: "actions", label: "GitHub", keywords: "code repos", Icon: FaGithub, run: () => openExternal(contactInfo.githubUrl) },
    { id: "linkedin", group: "actions", label: "LinkedIn", keywords: "cv work", Icon: FaLinkedin, run: () => openExternal(contactInfo.linkedinUrl) },
    {
      id: "language",
      group: "actions",
      label: paletteTexts("commands.language"),
      keywords: "idioma language english español",
      Icon: Languages,
      run: () => switchLocale(otherLocale),
    },
    {
      id: "storm",
      group: "fun",
      label: paletteTexts("commands.storm"),
      keywords: "tormenta storm lluvia rain rayo",
      Icon: CloudLightning,
      run: () => {
        ambienceStore.triggerStorm();
        return paletteTexts("stormStarted");
      },
    },
    {
      id: "whoami",
      group: "fun",
      label: "whoami",
      keywords: "quien soy about",
      Icon: Terminal,
      run: () => paletteTexts("whoami"),
    },
  ];
}
