"use client";

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCommands, type Command, type CommandGroup } from "./use-commands";

const GROUP_ORDER: CommandGroup[] = ["navigate", "actions", "fun"];

/** Lower-cases and strips accents, so "busqueda" matches "Búsqueda". */
const normalize = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function filterCommands(commands: Command[], query: string) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return commands;
  return commands.filter((command) => {
    const haystack = normalize(`${command.label} ${command.keywords ?? ""}`);
    return terms.every((term) => haystack.includes(term));
  });
}

/**
 * Ctrl/⌘ + K palette: jump to pages, run actions and a few playful extras. Loaded on first open.
 * It opens and closes without animation: a keyboard tool used often should feel instant.
 */
export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const paletteTexts = useTranslations("palette");
  const commands = useCommands();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [output, setOutput] = useState("");

  const results = useMemo(() => filterCommands(commands, query), [commands, query]);
  const ordered = GROUP_ORDER.flatMap((group) => results.filter((command) => command.group === group));
  const active = ordered[Math.min(activeIndex, ordered.length - 1)];

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setQuery("");
      setActiveIndex(0);
      setOutput("");
    }
  };

  const runCommand = async (command: Command) => {
    const message = await command.run();
    if (message) setOutput(message);
    else handleOpenChange(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!ordered.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => (Math.min(index, ordered.length - 1) + step + ordered.length) % ordered.length);
    } else if (event.key === "Enter" && active) {
      event.preventDefault();
      void runCommand(active);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-120 bg-black/60 backdrop-blur-sm" />
        <Dialog.Popup className="fixed left-1/2 top-[12vh] z-121 w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-card shadow-2xl shadow-signal/10">
          <Dialog.Title className="sr-only">{paletteTexts("title")}</Dialog.Title>
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search aria-hidden className="size-4 shrink-0 text-muted-foreground" />
            <input
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={active ? `${listId}-${active.id}` : undefined}
              aria-label={paletteTexts("title")}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
                setOutput("");
              }}
              onKeyDown={handleKeyDown}
              placeholder={paletteTexts("placeholder")}
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <ul id={listId} role="listbox" aria-label={paletteTexts("title")} className="max-h-80 overflow-y-auto p-2">
            {GROUP_ORDER.map((group) => {
              const items = ordered.filter((command) => command.group === group);
              if (!items.length) return null;
              return (
                <li key={group} role="presentation">
                  <p className="px-2 pb-1 pt-2 font-data text-[0.7rem] uppercase tracking-wider text-muted-foreground">
                    {paletteTexts(`groups.${group}`)}
                  </p>
                  <ul role="presentation">
                    {items.map((command) => {
                      const isActive = command === active;
                      return (
                        <li
                          key={command.id}
                          id={`${listId}-${command.id}`}
                          role="option"
                          aria-selected={isActive}
                          onMouseMove={() => setActiveIndex(ordered.indexOf(command))}
                          onClick={() => void runCommand(command)}
                          className={`flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-2 text-sm transition-colors ${
                            isActive ? "bg-signal/15 text-signal" : "text-foreground"
                          }`}
                        >
                          <command.Icon aria-hidden className="size-4 shrink-0" />
                          {command.label}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
            {!ordered.length && <li className="px-2 py-6 text-center text-sm text-muted-foreground">{paletteTexts("empty")}</li>}
          </ul>

          <p aria-live="polite" className={output ? "border-t border-border px-4 py-3 font-data text-xs leading-relaxed text-signal" : "sr-only"}>
            {output && <span className="text-muted-foreground">&gt; </span>}
            {output}
          </p>

          <p className="flex gap-4 border-t border-border px-4 py-2 font-data text-[0.7rem] text-muted-foreground">
            <span>↑↓ {paletteTexts("hints.move")}</span>
            <span>↵ {paletteTexts("hints.run")}</span>
            <span>esc {paletteTexts("hints.close")}</span>
          </p>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
