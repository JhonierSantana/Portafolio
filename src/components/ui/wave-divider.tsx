export function WaveDivider({
  flip = false,
  size = "h-8 sm:h-14",
}: {
  flip?: boolean;
  size?: string;
}) {
  return (
    <div className={`relative w-full bg-background ${size}`}>
      <svg
        aria-hidden
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className={`h-full w-full fill-card ${flip ? "rotate-180" : ""}`}
      >
        <path d="M0,30 C240,55 480,5 720,30 C960,55 1200,5 1440,30 L1440,60 L0,60 Z" />
      </svg>
    </div>
  );
}
