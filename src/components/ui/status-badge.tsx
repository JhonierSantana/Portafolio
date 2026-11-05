import type { ReactNode } from "react";
import { PulseDot } from "@/components/ui/pulse-dot";

/** Pill with a pulsing dot, used for "in progress" and "available" notices. */
export function StatusBadge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-data text-xs text-signal ${className}`}
    >
      <PulseDot />
      {children}
    </span>
  );
}
