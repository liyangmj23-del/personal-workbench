"use server";

import { getCashStats, resolveDateRange, type DateRangeKey } from "@/lib/finance-stats";

export async function fetchCashStats(range: DateRangeKey, from?: string, to?: string) {
  const now = new Date();
  const resolved =
    range === "custom" && from && to
      ? { from: new Date(from), to: new Date(new Date(to).getTime() + 24 * 60 * 60 * 1000) }
      : resolveDateRange(range, now);
  return getCashStats(resolved.from, resolved.to);
}
