import type { ReactNode } from "react";

/** Pill with a pulsing dot, used for "in progress" and "available" notices. */
export function StatusBadge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-data text-xs text-signal ${className}`}
    >
      <span aria-hidden className="size-2 animate-pulse rounded-full bg-signal" />
      {children}
    </span>
  );
}
