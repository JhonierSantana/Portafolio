import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { MobileNav } from "./mobile-nav";
import { FloatingNav } from "./floating-nav";

export function Header() {
  const navTexts = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur">
      <div className="relative mx-auto grid max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4">
        <Link href="/" className="flex min-w-0 items-baseline gap-2 justify-self-start">
          <span className="font-display truncate text-base font-medium tracking-tight sm:text-lg">
            Jhonier Santana
          </span>
          <span className="font-data hidden shrink-0 text-xs text-signal sm:inline">
            / {navTexts("roleTag")}
          </span>
        </Link>

        <FloatingNav />

        <div className="flex items-center justify-self-end">
          <div className="hidden md:block">
            <LocaleSwitcher />
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
