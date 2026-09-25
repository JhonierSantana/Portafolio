"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { navRoutes } from "@/lib/nav-routes";
import { LocaleSwitcher } from "./locale-switcher";

const DRAWER_EASING = [0.32, 0.72, 0, 1] as const;
const DRAWER_DURATION_SECONDS = 0.4;

const VERTICAL_WAVE_PATH =
  "M30,0 C58,180 2,540 30,720 C58,900 2,1260 30,1440 C58,1620 2,1980 30,2160 C58,2340 2,2700 30,2880 L60,2880 L60,0 Z";

const linkListVariants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.18, staggerChildren: 0.07 } },
};
const linkVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0 },
};

const subscribeToNothing = () => () => {};

export function MobileNav() {
  const navTexts = useTranslations("nav");
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isClient = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );

  const closeDrawer = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: DRAWER_DURATION_SECONDS, ease: DRAWER_EASING };

  const drawer = (
    <AnimatePresence onExitComplete={() => triggerRef.current?.focus()}>
      {isOpen && (
        <>
          <motion.div
            key="mobile-nav-backdrop"
            aria-hidden
            className="fixed inset-0 z-[60] bg-black/65"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            onClick={closeDrawer}
          />
          <motion.aside
            key="mobile-nav-panel"
            id="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-label={navTexts("menuTitle")}
            className="fixed inset-y-0 right-0 z-[70] w-1/2 min-w-52 bg-card"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={transition}
          >
            {/* Wavy left edge, same motif as WaveDivider. */}
            <div aria-hidden className="absolute inset-y-0 right-full w-8 overflow-hidden">
              <svg
                viewBox="0 0 60 2880"
                preserveAspectRatio="none"
                className="animate-wave-drift-vertical h-[200%] w-full fill-card"
              >
                <path d={VERTICAL_WAVE_PATH} />
              </svg>
            </div>

            <button
              type="button"
              autoFocus
              onClick={closeDrawer}
              aria-label={navTexts("close")}
              className="absolute right-3 top-3 flex size-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            <div className="flex h-full flex-col items-center justify-center gap-10 px-4">
              <motion.ul
                className="flex flex-col items-center gap-6"
                variants={linkListVariants}
                initial="hidden"
                animate="visible"
              >
                {navRoutes.map((route) => {
                  const isActive = pathname === route.href;
                  return (
                    <motion.li key={route.href} variants={linkVariants}>
                      <Link
                        href={route.href}
                        onClick={closeDrawer}
                        aria-current={isActive ? "page" : undefined}
                        className={`font-display text-2xl transition-colors ${
                          isActive ? "text-signal" : "text-foreground hover:text-signal"
                        }`}
                      >
                        {navTexts(route.key)}
                      </Link>
                    </motion.li>
                  );
                })}
              </motion.ul>
              <motion.div
                variants={linkVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.5 }}
                className="border-t border-border pt-6"
              >
                <LocaleSwitcher onChange={closeDrawer} />
              </motion.div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-panel"
        aria-label={navTexts("menu")}
        className="flex size-10 items-center justify-center text-foreground"
      >
        <Menu className="size-5" />
      </button>
      {isClient && createPortal(drawer, document.body)}
    </div>
  );
}
