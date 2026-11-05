"use client";

import { useTranslations } from "next-intl";
import { PulseDot } from "@/components/ui/pulse-dot";
import { useStore } from "@/hooks/use-store";
import { ambienceStore } from "@/lib/ambience-store";
import { contactInfo } from "@/lib/contact-info";

/** "Socorro, Santander, CO" -> "Socorro, CO". */
const locationParts = contactInfo.location.split(",").map((part) => part.trim());
const SHORT_LOCATION = `${locationParts[0]}, ${locationParts.at(-1)}`;

/**
 * Live weather where Jhonier is, which is what drives the rain on the site.
 * Its line is reserved while the weather loads, so the hero never jumps.
 */
export function WeatherBadge() {
  const ambienceTexts = useTranslations("ambience");
  const { weather } = useStore(ambienceStore);

  return (
    <p
      title={ambienceTexts("liveHint")}
      className={`inline-flex min-h-5 items-center gap-2 font-data text-xs transition-opacity duration-700 ${
        weather ? "opacity-100" : "opacity-0"
      }`}
    >
      {weather && (
        <>
          <PulseDot />
          <span className="text-signal">{ambienceTexts("live")}</span>
          <span className="text-muted-foreground">
            · {SHORT_LOCATION} · {weather.temperatureC}°C, {ambienceTexts(`levels.${weather.level}`)}
          </span>
        </>
      )}
    </p>
  );
}
