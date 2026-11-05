export type RainLevel = "clear" | "light" | "heavy" | "storm";

export type WeatherReport = {
  temperatureC: number;
  level: RainLevel;
};

/** Socorro, Santander (Colombia). */
const SOCORRO = { latitude: 6.4683, longitude: -73.2597 };
const CACHE_KEY = "portfolio-weather";
const CACHE_MS = 15 * 60 * 1000;
const WEATHER_URL = `https://api.open-meteo.com/v1/forecast?latitude=${SOCORRO.latitude}&longitude=${SOCORRO.longitude}&current=temperature_2m,precipitation,weather_code&timezone=auto`;

const STORM_CODES = new Set([95, 96, 99]);
const HEAVY_CODES = new Set([63, 65, 67, 81, 82]);
const LIGHT_CODES = new Set([51, 53, 55, 56, 57, 61, 66, 80]);

/** Maps a WMO weather code (as returned by Open-Meteo) to how hard it rains on the site. */
export function rainLevelFromWeather(weatherCode: number, precipitationMm: number): RainLevel {
  if (STORM_CODES.has(weatherCode)) return "storm";
  if (HEAVY_CODES.has(weatherCode)) return "heavy";
  if (LIGHT_CODES.has(weatherCode) || precipitationMm > 0.1) return "light";
  return "clear";
}

type OpenMeteoResponse = {
  current: { temperature_2m: number; precipitation: number; weather_code: number };
};

/** Current weather in Socorro; cached for the session so navigation never refetches it. */
export async function fetchSocorroWeather(signal?: AbortSignal): Promise<WeatherReport> {
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    const { savedAt, report } = JSON.parse(cached) as { savedAt: number; report: WeatherReport };
    if (Date.now() - savedAt < CACHE_MS) return report;
  }

  const response = await fetch(WEATHER_URL, { signal });
  if (!response.ok) throw new Error(`Weather request failed: ${response.status}`);
  const { current } = (await response.json()) as OpenMeteoResponse;
  const report: WeatherReport = {
    temperatureC: Math.round(current.temperature_2m),
    level: rainLevelFromWeather(current.weather_code, current.precipitation),
  };
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), report }));
  return report;
}
