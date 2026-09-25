"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";

export function MobileNav() {
  const navTexts = useTranslations("nav");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-panel"
        aria-label={navTexts("menu")}
        className="flex min-h-6 min-w-6 items-center justify-center text-foreground"
      >
        {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {isOpen && (
        <div
          id="mobile-nav-panel"
          className="absolute inset-x-0 top-full border-b border-border bg-background px-6 py-6"
        >
          <nav className="flex flex-col gap-4 text-sm text-muted-foreground">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="hover:text-foreground transition-colors"
            >
              {navTexts("home")}
            </Link>
            <Link
              href="/sobre-mi"
              onClick={() => setIsOpen(false)}
              className="hover:text-foreground transition-colors"
            >
              {navTexts("about")}
            </Link>
            <Link
              href="/proyectos"
              onClick={() => setIsOpen(false)}
              className="hover:text-foreground transition-colors"
            >
              {navTexts("projects")}
            </Link>
            <Link
              href="/contacto"
              onClick={() => setIsOpen(false)}
              className="hover:text-foreground transition-colors"
            >
              {navTexts("contact")}
            </Link>
            <LocaleSwitcher />
          </nav>
        </div>
      )}
    </div>
  );
}
