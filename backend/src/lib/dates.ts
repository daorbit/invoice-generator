export const DAY_MS = 24 * 60 * 60 * 1000;

export function todayUtc(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export function daysBetween(from: Date | null | undefined, to: Date | null | undefined): number | undefined {
  if (!from || !to) return undefined;
  return Math.max(0, Math.round((to.getTime() - from.getTime()) / DAY_MS));
}
