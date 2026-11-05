"use client";

import { useSwitchLocale } from "@/hooks/use-switch-locale";

export function LocaleSwitcher({ onChange }: { onChange?: () => void }) {
  const { locale, locales, switchLocale } = useSwitchLocale();

  function handleChange(nextLocale: (typeof locales)[number]) {
    switchLocale(nextLocale);
    onChange?.();
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => handleChange(loc)}
          aria-current={loc === locale}
          className={`font-data flex min-h-6 min-w-6 items-center justify-center px-1 uppercase transition-colors ${
            loc === locale
              ? "text-signal underline underline-offset-4"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
