"use client";

import { useState, useTransition } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/language-provider";
import { categoryLabel, chartColorFor } from "@/lib/categories";
import { formatCNY } from "@/lib/format";
import { fetchCashStats } from "@/lib/actions/finance-stats";
import type { CashStats, DateRangeKey, MonthlyPoint } from "@/lib/finance-stats";
import type { Lang } from "@/lib/i18n/dictionary";

type Props = {
  initialStats: CashStats;
  monthlyTrend: MonthlyPoint[];
  hasCashFlowAccounts: boolean;
};

const RANGE_KEYS: Exclude<DateRangeKey, "custom">[] = ["this_month", "last_month", "last_3_months", "this_year", "all"];

const RANGE_LABEL_KEY = {
  this_month: "fin_range_this_month",
  last_month: "fin_range_last_month",
  last_3_months: "fin_range_last_3_months",
  this_year: "fin_range_this_year",
  all: "fin_range_all",
} as const;

export function StatsPanel({ initialStats, monthlyTrend, hasCashFlowAccounts }: Props) {
  const { t, lang } = useLanguage();
  const [range, setRange] = useState<DateRangeKey>("this_month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [stats, setStats] = useState(initialStats);
  const [pending, startTransition] = useTransition();

  function applyRange(next: DateRangeKey, from?: string, to?: string) {
    setRange(next);
    startTransition(async () => {
      const result = await fetchCashStats(next, from, to);
      setStats(result);
    });
  }

  const exportHref =
    range === "custom" && customFrom && customTo
      ? `/finance/export?range=custom&from=${customFrom}&to=${customTo}`
      : `/finance/export?range=${range}`;

  const bucketed = bucketExpenses(stats.expenseByCategory, lang, t.fin_stats_other);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {RANGE_KEYS.map((key) => (
          <Button
            key={key}
            size="sm"
            variant={range === key ? "default" : "outline"}
            onClick={() => applyRange(key)}
          >
            {t[RANGE_LABEL_KEY[key]]}
          </Button>
        ))}
        <Button size="sm" variant={range === "custom" ? "default" : "outline"} onClick={() => setRange("custom")}>
          {t.fin_range_custom}
        </Button>
        {range === "custom" && (
          <>
            <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="w-40" />
            <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="w-40" />
            <Button
              size="sm"
              variant="outline"
              disabled={!customFrom || !customTo}
              onClick={() => applyRange("custom", customFrom, customTo)}
            >
              {t.fin_stats_apply}
            </Button>
          </>
        )}
        <Button size="sm" variant="outline" className="ml-auto" nativeButton={false} render={<a href={exportHref} />}>
          {t.fin_export_csv}
        </Button>
      </div>

      {!hasCashFlowAccounts ? (
        <p className="text-sm text-muted-foreground">{t.fin_stats_no_cash_account}</p>
      ) : (
        <div className={pending ? "flex flex-col gap-4 opacity-60 transition-opacity" : "flex flex-col gap-4"}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t.fin_stats_income}</CardDescription>
                <CardTitle className="text-status-good text-xl">{formatCNY(stats.income, lang)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t.fin_stats_expense}</CardDescription>
                <CardTitle className="text-status-bad text-xl">{formatCNY(stats.expense, lang)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t.fin_stats_net}</CardDescription>
                <CardTitle className={`text-xl ${stats.net >= 0 ? "text-status-good" : "text-status-bad"}`}>
                  {formatCNY(stats.net, lang)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.fin_stats_by_category}</CardTitle>
            </CardHeader>
            <CardContent>
              {bucketed.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.fin_stats_no_data}</p>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(120, bucketed.length * 40)}>
                  <BarChart data={bucketed} layout="vertical" margin={{ left: 8, right: 56 }} barSize={20}>
                    <CartesianGrid horizontal={false} stroke="var(--border)" />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={80}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    />
                    <Tooltip content={<CategoryTooltip lang={lang} total={stats.expense} />} cursor={{ fill: "var(--muted)" }} />
                    <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                      {bucketed.map((entry) => (
                        <Cell key={entry.key} fill={entry.color} />
                      ))}
                      <LabelList
                        dataKey="amount"
                        position="right"
                        formatter={(v) => formatCNY(Number(v), lang)}
                        style={{ fill: "var(--foreground)", fontSize: 12 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.fin_stats_monthly_trend}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyTrend} barGap={2} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip
                    content={<TrendTooltip lang={lang} incomeLabel={t.fin_stats_income} expenseLabel={t.fin_stats_expense} />}
                    cursor={{ fill: "var(--muted)" }}
                  />
                  <Legend
                    formatter={(value) => (value === "income" ? t.fin_stats_income : t.fin_stats_expense)}
                    iconType="circle"
                  />
                  <Bar dataKey="income" fill="var(--status-good)" radius={[4, 4, 0, 0]} maxBarSize={24} name="income" />
                  <Bar dataKey="expense" fill="var(--status-bad)" radius={[4, 4, 0, 0]} maxBarSize={24} name="expense" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function bucketExpenses(
  totals: CashStats["expenseByCategory"],
  lang: Lang,
  otherLabel: string
): { key: string; label: string; amount: number; color: string }[] {
  const fixed: { key: string; label: string; amount: number; color: string }[] = [];
  let otherTotal = 0;
  for (const { key, amount } of totals) {
    const color = chartColorFor(key);
    if (color === "var(--muted-foreground)") {
      otherTotal += amount;
    } else {
      fixed.push({ key, label: categoryLabel(key, lang), amount, color });
    }
  }
  const rows = [...fixed];
  if (otherTotal > 0) {
    rows.push({ key: "__other__", label: otherLabel, amount: otherTotal, color: "var(--muted-foreground)" });
  }
  return rows.sort((a, b) => b.amount - a.amount);
}

function CategoryTooltip({
  active,
  payload,
  lang,
  total,
}: {
  active?: boolean;
  payload?: { payload: { label: string; amount: number } }[];
  lang: Lang;
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const { label, amount } = payload[0].payload;
  const pct = total > 0 ? ((amount / total) * 100).toFixed(1) : "0.0";
  return (
    <div className="bg-popover text-popover-foreground rounded-md border px-3 py-2 text-sm shadow-md">
      <div className="font-semibold">{formatCNY(amount, lang)}</div>
      <div className="text-muted-foreground">
        {label} · {pct}%
      </div>
    </div>
  );
}

function TrendTooltip({
  active,
  payload,
  label,
  lang,
  incomeLabel,
  expenseLabel,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number }[];
  label?: string;
  lang: Lang;
  incomeLabel: string;
  expenseLabel: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover text-popover-foreground rounded-md border px-3 py-2 text-sm shadow-md">
      <div className="text-muted-foreground mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span
            className="inline-block size-2 rounded-full"
            style={{ background: p.dataKey === "income" ? "var(--status-good)" : "var(--status-bad)" }}
          />
          <span className="font-semibold">{formatCNY(p.value, lang)}</span>
          <span className="text-muted-foreground">{p.dataKey === "income" ? incomeLabel : expenseLabel}</span>
        </div>
      ))}
    </div>
  );
}
