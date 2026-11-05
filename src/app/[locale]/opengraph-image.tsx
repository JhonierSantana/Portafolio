import { ImageResponse } from "next/og";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { STATIC_WAVE_PATH, STATIC_WAVE_VIEWBOX } from "@/lib/wave-paths";

export const alt = "Jhonier Santana";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// next/og cannot resolve the oklch() theme tokens, so the palette is repeated here as hex.
const COLORS = { background: "#0a0a0a", card: "#161616", foreground: "#f2f2f0", muted: "#a3a3a3", signal: "#4f8fe0" };

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Route handlers cannot read root params, so the translator from i18n/request.ts is unavailable here.
  const messageLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const { hero } = (await import(`../../../messages/${messageLocale}.json`)).default;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background: COLORS.background,
          color: COLORS.foreground,
        }}
      >
        <div style={{ fontSize: 30, color: COLORS.signal }}>{hero.greeting}</div>
        <div style={{ fontSize: 108, fontWeight: 600, letterSpacing: -3, lineHeight: 1.05 }}>{hero.name}</div>
        <div style={{ fontSize: 40, color: COLORS.muted, marginTop: 12 }}>{hero.role}</div>
        <div style={{ fontSize: 28, color: COLORS.muted, marginTop: 28 }}>{hero.tagline}</div>
        <svg
          viewBox={STATIC_WAVE_VIEWBOX}
          preserveAspectRatio="none"
          width="1200"
          height="120"
          style={{ position: "absolute", left: 0, bottom: 0 }}
        >
          <path d={STATIC_WAVE_PATH} fill={COLORS.card} />
        </svg>
      </div>
    ),
    size,
  );
}
