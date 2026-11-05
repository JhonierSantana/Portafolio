import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/** Current locale plus a function that reopens the current page in another one. */
export function useSwitchLocale() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (nextLocale: (typeof routing.locales)[number]) => {
    router.replace(pathname, { locale: nextLocale });
  };

  return { locale, locales: routing.locales, switchLocale };
}
