import {
  SCROLLING_WAVE_PATH,
  SCROLLING_WAVE_VIEWBOX,
  STATIC_WAVE_PATH,
  STATIC_WAVE_VIEWBOX,
} from "@/lib/wave-paths";

export function WaveDivider({
  flip = false,
  size = "h-8 sm:h-14",
  animated = false,
}: {
  flip?: boolean;
  size?: string;
  animated?: boolean;
}) {
  return (
    <div className={`relative w-full overflow-hidden ${size} ${flip ? "rotate-180" : ""}`}>
      <svg
        aria-hidden
        viewBox={animated ? SCROLLING_WAVE_VIEWBOX : STATIC_WAVE_VIEWBOX}
        preserveAspectRatio="none"
        className={`h-full fill-card ${animated ? "w-[200%] animate-wave-drift" : "w-full"}`}
      >
        <path d={animated ? SCROLLING_WAVE_PATH : STATIC_WAVE_PATH} />
      </svg>
    </div>
  );
}
