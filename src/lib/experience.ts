/** `YYYY-MM` */
export type YearMonth = `${number}-${number}`;

export type ExperienceDates = {
  /** Matches `experience.items[].id` in messages/*.json. */
  id: string;
  start: YearMonth;
  /** null while the role is current. */
  end: YearMonth | null;
  /** Training programmes are listed but not counted as professional experience. */
  training?: boolean;
};

/** Newest first, the same order as the items in messages/*.json. */
export const experienceDates: ExperienceDates[] = [
  { id: "bartik", start: "2025-05", end: null },
  { id: "attendv", start: "2024-05", end: "2024-10" },
  { id: "autonomic-mind", start: "2023-09", end: "2023-10" },
  { id: "holberton", start: "2022-09", end: "2023-07", training: true },
];

const toMonthIndex = (yearMonth: YearMonth) => {
  const [year, month] = yearMonth.split("-").map(Number);
  return year * 12 + (month - 1);
};

export const yearOf = (yearMonth: YearMonth) => Number(yearMonth.slice(0, 4));

/** Months worked, counting the first and the last month (May to October is 6 months). */
export function monthsWorked({ start, end }: Pick<ExperienceDates, "start" | "end">, now = new Date()) {
  const endIndex = end ? toMonthIndex(end) : now.getFullYear() * 12 + now.getMonth();
  return Math.max(1, endIndex - toMonthIndex(start) + 1);
}

/** Total professional experience in months (training programmes excluded). */
export function professionalMonths(entries: ExperienceDates[], now = new Date()) {
  return entries.filter((entry) => !entry.training).reduce((total, entry) => total + monthsWorked(entry, now), 0);
}

export const splitMonths = (months: number) => ({ years: Math.floor(months / 12), months: months % 12 });

/** `2025-05` -> a `Date` on that month, for `Intl.DateTimeFormat`. */
export const toDate = (yearMonth: YearMonth) => {
  const [year, month] = yearMonth.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 15));
};
