export type CountTarget = {
  /** The number to count up to. */
  target: number;
  /** Whatever follows the number, such as the "+" in "100+". */
  suffix: string;
};

/** Reads a figure such as "4" or "100+". Anything else (a word, a range) is not countable: null. */
export function parseCount(value: string): CountTarget | null {
  const match = /^(\d+)(\D*)$/.exec(value.trim());
  return match ? { target: Number(match[1]), suffix: match[2] } : null;
}

export const formatCount = (current: number, { suffix }: CountTarget) => `${Math.round(current)}${suffix}`;
