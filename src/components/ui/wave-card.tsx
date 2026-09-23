import type { ReactNode } from "react";
import { WaveDivider } from "@/components/ui/wave-divider";

export function WaveCard({
  children,
  className = "",
  bleed = false,
}: {
  children: ReactNode;
  className?: string;
  /** Break out of the parent container to span the full viewport width, like the Hero band. */
  bleed?: boolean;
}) {
  const waveSize = bleed ? "h-8 sm:h-14" : "h-4 sm:h-6";

  return (
    <div className={bleed ? "relative left-1/2 right-1/2 -mx-[50vw] w-screen" : "relative"}>
      <WaveDivider size={waveSize} />
      <div className={`bg-card px-6 py-6 ${className}`}>{children}</div>
      <WaveDivider flip size={waveSize} />
    </div>
  );
}
