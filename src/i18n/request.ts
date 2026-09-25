import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { locale as localeFromRoute } from "next/root-params";
import { routing } from "./routing";

// Locale comes from the [locale] root param, so pages stay statically rendered
// without calling the deprecated setRequestLocale().
export default getRequestConfig(async () => {
  const requestedLocale = await localeFromRoute();
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
