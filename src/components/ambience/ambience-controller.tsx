"use client";

import { useEffect } from "react";
import { ambienceStore } from "@/lib/ambience-store";
import { fetchSocorroWeather } from "@/lib/weather";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

function whenIdle(callback: () => void) {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(callback, { timeout: 3000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = globalThis.setTimeout(callback, 1500);
  return () => globalThis.clearTimeout(id);
}

/** Side effects of the ambience (no UI): live weather and the storm easter egg. */
export function AmbienceController() {
  // Weather is decoration: fetch it once the page is idle so it never competes with loading.
  useEffect(() => {
    const abort = new AbortController();
    const cancelIdle = whenIdle(() => {
      fetchSocorroWeather(abort.signal)
        .then(ambienceStore.setWeather)
        .catch(() => {
          // Offline or API down: keep the default light rain.
        });
    });
    return () => {
      cancelIdle();
      abort.abort();
    };
  }, []);

  // Easter egg: the Konami code unleashes a storm (hinted in the browser console).
  useEffect(() => {
    console.info("%c~ ↑ ↑ ↓ ↓ ← → ← → B A ~", "color:#4f8fe0;font-size:14px");
    let position = 0;
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable]")) return;
      // Browser autofill fires keydown events without a `key`.
      if (typeof event.key !== "string") return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      position = key === KONAMI[position] ? position + 1 : key === KONAMI[0] ? 1 : 0;
      if (position === KONAMI.length) {
        position = 0;
        ambienceStore.triggerStorm();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
