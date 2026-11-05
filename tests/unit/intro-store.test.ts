import { beforeEach, describe, expect, it, vi } from "vitest";
import { introStore } from "@/lib/intro-store";

describe("introStore", () => {
  beforeEach(() => introStore.reset());

  it("starts neither ready nor dismissed", () => {
    expect(introStore.getSnapshot()).toEqual({ avatarReady: false, dismissed: false });
  });

  it("notifies subscribers when state changes", () => {
    const listener = vi.fn();
    introStore.subscribe(listener);
    introStore.markAvatarReady();
    introStore.dismiss();
    expect(listener).toHaveBeenCalledTimes(2);
    expect(introStore.getSnapshot()).toEqual({ avatarReady: true, dismissed: true });
  });

  it("ignores repeated updates so subscribers do not re-render for nothing", () => {
    const listener = vi.fn();
    introStore.subscribe(listener);
    introStore.markAvatarReady();
    introStore.markAvatarReady();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("stops notifying after unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = introStore.subscribe(listener);
    unsubscribe();
    introStore.dismiss();
    expect(listener).not.toHaveBeenCalled();
  });
});
