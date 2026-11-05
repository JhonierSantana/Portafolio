"use client";

import { CloudDrizzle, CloudLightning, CloudRain, CloudSun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useStore } from "@/hooks/use-store";
import { ambienceStore } from "@/lib/ambience-store";
import type { RainLevel } from "@/lib/weather";

const ICONS: Record<RainLevel, typeof CloudRain> = {
  clear: CloudSun,
  light: CloudDrizzle,
  heavy: CloudRain,
  storm: CloudLightning,
};

/** Live weather in Socorro, which is what drives the rain on the site. Hidden until it loads. */
export function WeatherBadge() {
  const ambienceTexts = useTranslations("ambience");
  const { weather } = useStore(ambienceStore);
  if (!weather) return null;
  const Icon = ICONS[weather.level];

  return (
    <p className="inline-flex items-center gap-2 font-data text-xs text-muted-foreground" title={ambienceTexts("weatherHint")}>
      <Icon aria-hidden className="size-4 text-signal" />
      <span>
        {ambienceTexts("weatherNow")} · {weather.temperatureC}°C · {ambienceTexts(`levels.${weather.level}`)}
      </span>
    </p>
  );
}
