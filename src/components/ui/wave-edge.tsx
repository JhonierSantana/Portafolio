import { STATIC_WAVE_PATH, STATIC_WAVE_VIEWBOX } from "@/lib/wave-paths";

/**
 * Card-coloured wavy fringe that hangs below its (relatively positioned) parent.
 * It sits outside the parent's box, so it only shows once the parent slides up.
 */
export function WaveEdge() {
  return (
    <svg
      aria-hidden
      viewBox={STATIC_WAVE_VIEWBOX}
      preserveAspectRatio="none"
      className="absolute left-0 top-full h-8 w-full rotate-180 fill-card sm:h-14"
    >
      <path d={STATIC_WAVE_PATH} />
    </svg>
  );
}
