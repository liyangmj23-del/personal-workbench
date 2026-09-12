import { db } from "@/lib/db";

export type DateRangeKey = "this_month" | "last_month" | "last_3_months" | "this_year" | "all" | "custom";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** Resolves a preset range key to [from, to). `to` is exclusive (start of the
 * day after the range ends) so date-only comparisons don't drop the last day.
 * "custom" has no preset meaning here — callers must supply explicit from/to
 * and never reach this function for that key (see fetchCashStats). */
export function resolveDateRange(key: DateRangeKey, now: Date): { from: Date; to: Date } {
  const thisMonthStart = startOfMonth(now);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  switch (key) {
    case "this_month":
      return { from: thisMonthStart, to: nextMonthStart };
    case "last_month":
      return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: thisMonthStart };
    case "last_3_months":
      return { from: new Date(now.getFullYear(), now.getMonth() - 2, 1), to: nextMonthStart };
    case "this_year":
      return { from: new Date(now.getFullYear(), 0, 1), to: new Date(now.getFullYear() + 1, 0, 1) };
    case "all":
    case "custom":
      return { from: new Date(2000, 0, 1), to: nextMonthStart };
  }
}

/** Account types whose transactions count as day-to-day cash flow — everything
 * except INVESTMENT, which tracks holdings/P&L instead (mirrors the
 * `transactableAccounts` filter already used on the finance page). */
export function isCashFlowAccount(type: string): boolean {
  return type !== "INVESTMENT";
}

export type CategoryTotal = { key: string; amount: number };

export type CashStats = {
  income: number;
  expense: number;
  net: number;
  transactionCount: number;
  expenseByCategory: CategoryTotal[];
};

export async function getCashStats(from: Date, to: Date): Promise<CashStats> {
  const accounts = await db.account.findMany({ where: { NOT: { type: "INVESTMENT" } } });
  const accountIds = accounts.map((a) => a.id);
  if (accountIds.length === 0) {
    return { income: 0, expense: 0, net: 0, transactionCount: 0, expenseByCategory: [] };
  }

  const txs = await db.transaction.findMany({
    where: { accountId: { in: accountIds }, date: { gte: from, lt: to } },
  });

  let income = 0;
  let expense = 0;
  const byCategory = new Map<string, number>();
  for (const tx of txs) {
    if (tx.amount >= 0) {
      income += tx.amount;
    } else {
      expense += -tx.amount;
      byCategory.set(tx.category, (byCategory.get(tx.category) ?? 0) + -tx.amount);
    }
  }

  const expenseByCategory = [...byCategory.entries()]
    .map(([key, amount]) => ({ key, amount }))
    .sort((a, b) => b.amount - a.amount);

  return { income, expense, net: income - expense, transactionCount: txs.length, expenseByCategory };
}

export type MonthlyPoint = { month: string; income: number; expense: number };

export async function getMonthlyTrend(now: Date, months: number): Promise<MonthlyPoint[]> {
  const accounts = await db.account.findMany({ where: { NOT: { type: "INVESTMENT" } } });
  const accountIds = accounts.map((a) => a.id);

  const from = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const points: MonthlyPoint[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1) + i, 1);
    points.push({ month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, income: 0, expense: 0 });
  }
  if (accountIds.length === 0) return points;

  const txs = await db.transaction.findMany({
    where: { accountId: { in: accountIds }, date: { gte: from, lt: to } },
  });

  const indexByMonth = new Map(points.map((p, i) => [p.month, i]));
  for (const tx of txs) {
    const key = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, "0")}`;
    const idx = indexByMonth.get(key);
    if (idx === undefined) continue;
    if (tx.amount >= 0) points[idx].income += tx.amount;
    else points[idx].expense += -tx.amount;
  }
  return points;
}
