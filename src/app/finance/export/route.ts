import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { resolveDateRange, type DateRangeKey } from "@/lib/finance-stats";
import { categoryLabel } from "@/lib/categories";
import { getDict } from "@/lib/i18n/get-lang";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rangeKey = (searchParams.get("range") ?? "this_month") as DateRangeKey;
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const { lang, t } = await getDict();
  const now = new Date();
  const { from, to } =
    rangeKey === "custom" && fromParam && toParam
      ? { from: new Date(fromParam), to: new Date(new Date(toParam).getTime() + 24 * 60 * 60 * 1000) }
      : resolveDateRange(rangeKey, now);

  const accounts = await db.account.findMany({ where: { NOT: { type: "INVESTMENT" } } });
  const accountIds = accounts.map((a) => a.id);

  const transactions = accountIds.length
    ? await db.transaction.findMany({
        where: { accountId: { in: accountIds }, date: { gte: from, lt: to } },
        include: { account: true },
        orderBy: { date: "asc" },
      })
    : [];

  const headers = [t.fin_col_date, t.fin_col_account, t.fin_col_category, t.fin_col_note, t.fin_col_amount];
  const rows = transactions.map((tx) => [
    tx.date.toISOString().slice(0, 10),
    tx.account.name,
    categoryLabel(tx.category, lang),
    tx.note ?? "",
    tx.amount.toFixed(2),
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => csvEscape(String(cell))).join(",")).join("\r\n");
  const withBom = "﻿" + csv;

  return new Response(withBom, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transactions_${rangeKey}.csv"`,
    },
  });
}
