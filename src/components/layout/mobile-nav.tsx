"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";

export function MobileNav() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={t("menu")}
        className="flex min-h-6 min-w-6 items-center justify-center text-foreground"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div
          id="mobile-nav-panel"
          className="absolute inset-x-0 top-full border-b border-border bg-background px-6 py-6"
        >
          <nav className="flex flex-col gap-4 text-sm text-muted-foreground">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="hover:text-foreground transition-colors"
            >
              {t("home")}
            </Link>
            <Link
              href="/sobre-mi"
              onClick={() => setOpen(false)}
              className="hover:text-foreground transition-colors"
            >
              {t("about")}
            </Link>
            <Link
              href="/proyectos"
              onClick={() => setOpen(false)}
              className="hover:text-foreground transition-colors"
            >
              {t("projects")}
            </Link>
            <Link
              href="/contacto"
              onClick={() => setOpen(false)}
              className="hover:text-foreground transition-colors"
            >
              {t("contact")}
            </Link>
            <LocaleSwitcher />
          </nav>
        </div>
      )}
    </div>
  );
}
