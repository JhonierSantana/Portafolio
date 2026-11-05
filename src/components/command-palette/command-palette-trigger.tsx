"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Command } from "lucide-react";
import { useTranslations } from "next-intl";

// The palette (and its commands) is only downloaded the first time it is opened.
const CommandPalette = dynamic(() => import("./command-palette").then((module) => module.CommandPalette), { ssr: false });

/** Header button plus the global Ctrl/⌘ + K shortcut that open the command palette. */
export function CommandPaletteTrigger() {
  const paletteTexts = useTranslations("palette");
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const show = () => {
    setHasOpened(true);
    setOpen(true);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Browser autofill fires keydown events without a `key`.
      if (event.key?.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setHasOpened(true);
        setOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-label={paletteTexts("open")}
        aria-keyshortcuts="Control+K Meta+K"
        title={paletteTexts("open")}
        className="flex h-10 min-w-10 cursor-pointer items-center justify-center gap-1.5 rounded-full px-2 text-muted-foreground transition-colors hover:text-signal focus-visible:outline-2 focus-visible:outline-signal"
      >
        <Command aria-hidden className="size-4" />
        <span aria-hidden className="hidden font-data text-xs lg:inline">
          K
        </span>
      </button>
      {hasOpened && <CommandPalette open={open} onOpenChange={setOpen} />}
    </>
  );
}
