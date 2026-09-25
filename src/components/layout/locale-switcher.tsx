"use client";

import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleSwitcher({ onChange }: { onChange?: () => void }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function handleChange(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
    onChange?.();
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {routing.locales.map((loc) => (
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
