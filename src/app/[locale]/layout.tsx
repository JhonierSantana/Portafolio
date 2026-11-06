import type { Metadata } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/site";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AmbientBackground } from "@/components/ambience/ambient-background";
import { AmbienceController } from "@/components/ambience/ambience-controller";
import { DepthGauge } from "@/components/layout/depth-gauge";
import { IntroLoader } from "@/components/intro/intro-loader";
import { IntroSeenScript } from "@/components/intro/intro-seen-script";
import { HoverRipple } from "@/components/motion/hover-ripple";
import "../globals.css";

// Fonts are self-hosted (from @fontsource packages) instead of next/font/google: Google sometimes
// serves font URLs that Turbopack cannot parse, which breaks dev and builds. Latin covers ES and EN.
// Paths must be string literals (next/font reads them at build time).

const fraunces = localFont({
  variable: "--font-display",
  // Variable font with every axis the titles use: weight, optical size, SOFT and WONK.
  src: [{ path: "../../../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2", weight: "100 900", style: "normal" }],
});

const plexSans = localFont({
  variable: "--font-sans",
  src: [
    { path: "../../../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
});

const plexMono = localFont({
  variable: "--font-data",
  src: [
    { path: "../../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const metaTexts = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(siteUrl),
    title: metaTexts("title"),
    description: metaTexts("description"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        es: "/es",
        en: "/en",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const accessibilityTexts = await getTranslations({ locale, namespace: "a11y" });

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`dark ${fraunces.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <IntroSeenScript />
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:border focus-visible:border-signal focus-visible:bg-background focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm"
        >
          {accessibilityTexts("skipToContent")}
        </a>
        <AmbientBackground />
        <NextIntlClientProvider>
          <AmbienceController />
          <IntroLoader />
          <DepthGauge />
          <Header />
          <main id="main-content" className="flex-1 overflow-x-clip">
            {children}
          </main>
          <Footer />
          <HoverRipple />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
