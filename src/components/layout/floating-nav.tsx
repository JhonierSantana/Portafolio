"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const ROUTES = [
  { href: "/", key: "home" },
  { href: "/sobre-mi", key: "about" },
  { href: "/proyectos", key: "projects" },
  { href: "/contacto", key: "contact" },
] as const;

export function FloatingNav() {
  const navTexts = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {ROUTES.map((route) => {
        const active = pathname === route.href;
        return (
          <motion.div
            key={route.href}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Link
              href={route.href}
              aria-current={active}
              className="relative block px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {active && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-0 rounded-full bg-signal/15"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              <span className={`relative ${active ? "text-signal" : ""}`}>
                {navTexts(route.key)}
              </span>
              {active && (
                <motion.span
                  layoutId="nav-active-dot"
                  className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-signal"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}
