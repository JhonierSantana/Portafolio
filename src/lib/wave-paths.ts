/** Wave outlines shared by every wavy surface (dividers, page wipe, intro loader). */
const WAVE_PERIOD_PATH = "C240,55 480,5 720,30 C960,55 1200,5 1440,30";

export const STATIC_WAVE_VIEWBOX = "0 0 1440 60";
export const SCROLLING_WAVE_VIEWBOX = "0 0 2880 60";

export const STATIC_WAVE_PATH = `M0,30 ${WAVE_PERIOD_PATH} L1440,60 L0,60 Z`;
export const SCROLLING_WAVE_PATH = `M0,30 ${WAVE_PERIOD_PATH} C1680,55 1920,5 2160,30 C2400,55 2640,5 2880,30 L2880,60 L0,60 Z`;

/** Just the wavy line (no closing edges), for stroking instead of filling. */
export const WAVE_CREST_PATH = `M0,30 ${WAVE_PERIOD_PATH}`;
