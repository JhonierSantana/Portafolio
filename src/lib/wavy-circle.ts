type WavyCircleOptions = {
  center: number;
  baseRadius: number;
  amplitude: number;
  lobes: number;
  segments?: number;
};

/** SVG path of a circle whose edge undulates, echoing the wavy borders of WaveDivider. */
export function buildWavyCirclePath({
  center,
  baseRadius,
  amplitude,
  lobes,
  segments = 120,
}: WavyCircleOptions) {
  const commands: string[] = [];
  for (let segment = 0; segment <= segments; segment++) {
    const angle = (segment / segments) * Math.PI * 2;
    const radius = baseRadius + amplitude * Math.sin(angle * lobes);
    const command = segment === 0 ? "M" : "L";
    const pointX = (center + radius * Math.cos(angle)).toFixed(4);
    const pointY = (center + radius * Math.sin(angle)).toFixed(4);
    commands.push(`${command}${pointX},${pointY}`);
  }
  return `${commands.join(" ")} Z`;
}
