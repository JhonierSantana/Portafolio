import { afterEach, describe, expect, it, vi } from "vitest";
import { createStore } from "@/lib/create-store";
import { ambienceStore, selectRainLevel } from "@/lib/ambience-store";
import { rainLevelFromWeather } from "@/lib/weather";

describe("createStore", () => {
  it("only notifies when a value actually changes", () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    store.subscribe(listener);
    store.setState({ count: 0 });
    store.setState({ count: 1 });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot().count).toBe(1);
    expect(store.getServerSnapshot().count).toBe(0);
  });
});

describe("rainLevelFromWeather", () => {
  it.each([
    [95, 0, "storm"],
    [65, 0, "heavy"],
    [81, 0, "heavy"],
    [61, 0, "light"],
    [3, 0.4, "light"],
    [0, 0, "clear"],
    [3, 0, "clear"],
  ] as const)("code %i with %f mm is %s", (code, precipitation, level) => {
    expect(rainLevelFromWeather(code, precipitation)).toBe(level);
  });
});

describe("ambienceStore", () => {
  afterEach(() => {
    vi.useRealTimers();
    ambienceStore.reset();
  });

  it("drizzles until the real weather arrives, then follows it", () => {
    expect(selectRainLevel(ambienceStore.getSnapshot())).toBe("light");
    ambienceStore.setWeather({ temperatureC: 24, level: "clear" });
    expect(selectRainLevel(ambienceStore.getSnapshot())).toBe("clear");
  });

  it("lets the storm easter egg override the weather for a while", () => {
    vi.useFakeTimers();
    ambienceStore.setWeather({ temperatureC: 24, level: "clear" });
    ambienceStore.triggerStorm();
    expect(selectRainLevel(ambienceStore.getSnapshot())).toBe("storm");
    vi.advanceTimersByTime(15_000);
    expect(selectRainLevel(ambienceStore.getSnapshot())).toBe("clear");
  });

});
