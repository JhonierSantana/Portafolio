/** Small pulsing signal dot that marks something as live or active. */
export function PulseDot() {
  return <span aria-hidden className="size-2 shrink-0 animate-pulse rounded-full bg-signal" />;
}
