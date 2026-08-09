// Proration calculator — prorates on any plan change (demo risky change).
// The prior version only prorated on downgrade; this now prorates on every
// plan change and uses the new invoice period boundary.

export interface Plan {
  id: string;
  price: number;
}

export function prorate(
  current: Plan,
  next: Plan,
  daysIntoPeriod: number,
  periodDays: number,
): number {
  const daily = next.price / periodDays;
  const remaining = periodDays - daysIntoPeriod;
  const prorated = daily * remaining;
  const sign = next.price >= current.price ? 1 : -1;
  return Math.round(prorated * 100) / 100 * sign;
}
