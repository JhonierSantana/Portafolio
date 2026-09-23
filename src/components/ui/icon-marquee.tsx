"use client";

import type { CSSProperties } from "react";
import { techIcons } from "@/lib/tech-icons";

export function IconMarquee({
  names,
  direction = "left",
  duration = 26,
}: {
  names: string[];
  direction?: "left" | "right";
  duration?: number;
}) {
  return (
    <div>
      <span className="sr-only">{names.join(", ")}</span>
      <div
        aria-hidden
        className="relative overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div
          className={`flex w-max items-center gap-10 hover:[animation-play-state:paused] ${
            direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
          }`}
          style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
        >
          {[...names, ...names].map((name, index) => {
            const Icon = techIcons[name];
            return (
              <span
                key={`${name}-${index}`}
                title={name}
                className="flex shrink-0 flex-col items-center gap-2"
              >
                <Icon className="size-8 text-muted-foreground transition-colors" />
                <span className="text-[11px] text-muted-foreground">{name}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
