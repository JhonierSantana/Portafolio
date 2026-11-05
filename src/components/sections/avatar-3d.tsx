"use client";

import { useEffect, useRef, useState } from "react";
import { AvatarRing } from "@/components/sections/avatar-ring";
import type { AvatarScene } from "@/lib/avatar/avatar-scene";
import { useStore } from "@/hooks/use-store";
import { ambienceStore, selectRainLevel } from "@/lib/ambience-store";
import { introStore } from "@/lib/intro-store";
import { PAGE_TRANSITION_SECONDS } from "@/lib/motion";

/**
 * Set to "/models/avatar.glb" once a Meshy/Tripo export is placed in public/models/;
 * while undefined the procedural character is rendered (and no request is made).
 */
const AVATAR_MODEL_URL: string | undefined = undefined;

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function Avatar3D({ label, className = "" }: { label: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<AvatarScene | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const rainLevel = selectRainLevel(useStore(ambienceStore));
  const wantsUmbrella = rainLevel === "heavy" || rainLevel === "storm";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    let waveTimer = 0;
    let startTimer = 0;
    // three.js is only downloaded on the client, in its own chunk; without WebGL the photo avatar stays.
    // Creating the scene blocks the main thread, so it waits until the page transition has finished.
    const start = new Promise<void>((resolve) => {
      startTimer = window.setTimeout(resolve, PAGE_TRANSITION_SECONDS * 1000 + 100);
    });
    start
      .then(() => {
        if (!supportsWebGL()) throw new Error("WebGL unavailable");
        return import("@/lib/avatar/avatar-scene");
      })
      .then(({ createAvatarScene }) => createAvatarScene(container, { modelUrl: AVATAR_MODEL_URL, reducedMotion: reduceMotion }))
      .then((scene) => {
        if (cancelled) {
          scene.dispose();
          return;
        }
        sceneRef.current = scene;
        setStatus("ready");
        introStore.markAvatarReady();
        if (!reduceMotion) waveTimer = window.setTimeout(() => scene.wave(), 1200);
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("fallback");
        introStore.markAvatarReady();
      });

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      window.clearTimeout(waveTimer);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  // When it rains hard in Socorro (or during the storm easter egg) the avatar opens its umbrella.
  useEffect(() => {
    if (status === "ready") sceneRef.current?.setUmbrella(wantsUmbrella);
  }, [status, wantsUmbrella]);

  if (status === "fallback") return <AvatarRing size="size-36 sm:size-44" imgSize={176} />;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => sceneRef.current?.wave()}
      className={`group relative block shrink-0 cursor-pointer rounded-[2rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[12%] bottom-[6%] top-[18%] rounded-full bg-signal/20 blur-3xl transition-opacity duration-500 group-hover:opacity-80"
      />
      <div
        ref={containerRef}
        className={`relative size-full transition-opacity duration-700 [mask-image:linear-gradient(to_bottom,black_80%,transparent)] ${status === "ready" ? "opacity-100" : "opacity-0"}`}
      />
    </button>
  );
}
