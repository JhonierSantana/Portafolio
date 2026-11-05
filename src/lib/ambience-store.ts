import { createStore } from "@/lib/create-store";
import type { RainLevel, WeatherReport } from "@/lib/weather";

const STORM_SECONDS = 15;

export type AmbienceState = {
  /** Live weather in Socorro; null until it loads (or if it fails). */
  weather: WeatherReport | null;
  /** Easter-egg storm, temporarily overriding the real weather. */
  storm: boolean;
};

const store = createStore<AmbienceState>({ weather: null, storm: false });
let stormTimer: ReturnType<typeof setTimeout> | undefined;

/** Rain shown on the site: the storm easter egg wins, then the real weather, else a light drizzle. */
export function selectRainLevel({ storm, weather }: AmbienceState): RainLevel {
  if (storm) return "storm";
  return weather?.level ?? "light";
}

/** Sea and rain state shared by the background, the avatar and the command palette. */
export const ambienceStore = {
  ...store,
  setWeather: (weather: WeatherReport) => store.setState({ weather }),
  triggerStorm: () => {
    clearTimeout(stormTimer);
    store.setState({ storm: true });
    stormTimer = setTimeout(() => store.setState({ storm: false }), STORM_SECONDS * 1000);
  },
};
