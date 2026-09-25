const WAVE_PERIOD_PATH = "C240,55 480,5 720,30 C960,55 1200,5 1440,30";

const STATIC_WAVE_PATH = `M0,30 ${WAVE_PERIOD_PATH} L1440,60 L0,60 Z`;
const SCROLLING_WAVE_PATH = `M0,30 ${WAVE_PERIOD_PATH} C1680,55 1920,5 2160,30 C2400,55 2640,5 2880,30 L2880,60 L0,60 Z`;

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
    <div className={`relative w-full overflow-hidden bg-background ${size} ${flip ? "rotate-180" : ""}`}>
      <svg
        aria-hidden
        viewBox={animated ? "0 0 2880 60" : "0 0 1440 60"}
        preserveAspectRatio="none"
        className={`h-full fill-card ${animated ? "w-[200%] animate-wave-drift" : "w-full"}`}
      >
        <path d={animated ? SCROLLING_WAVE_PATH : STATIC_WAVE_PATH} />
      </svg>
    </div>
  );
}
