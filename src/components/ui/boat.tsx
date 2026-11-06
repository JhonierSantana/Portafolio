/**
 * Small boat seen from above, bow pointing down (+y), drawn around the origin so a parent can
 * `translate()` and `rotate()` it along a path. Shared by the experience rail and the route map.
 */
export function Boat({ scale = 1.6 }: { scale?: number }) {
  return (
    <g transform={`scale(${scale})`}>
      {/* Wake fanning out symmetrically behind the stern. */}
      <path d="M-4,-11 L-9,-24 M4,-11 L9,-24" className="stroke-signal/50" strokeWidth={1.2} strokeLinecap="round" fill="none" />
      {/* Hull. */}
      <path
        d="M0,15 C6,9 7,0 6.5,-6 C6,-10 4,-12 0,-12 C-4,-12 -6,-10 -6.5,-6 C-7,0 -6,9 0,15 Z"
        className="fill-foreground stroke-background"
        strokeWidth={1}
      />
      {/* Deck and cabin. */}
      <path d="M0,10 C3.5,6 4,0 3.8,-5 L-3.8,-5 C-4,0 -3.5,6 0,10 Z" className="fill-signal" />
      <rect x={-2.5} y={-3} width={5} height={6} rx={1.2} className="fill-background" />
    </g>
  );
}
