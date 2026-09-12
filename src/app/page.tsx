import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

function formatCNY(n: number) {
  return n.toLocaleString("zh-CN", { style: "currency", currency: "CNY", maximumFractionDigits: 2 });
}

export default async function DashboardPage() {
  const [cashAccounts, investAccounts, holdings, recentNotes, recentPersons] = await Promise.all([
    db.account.findMany({ where: { type: "CASH" }, include: { transactions: true } }),
    db.account.findMany({ where: { type: "INVESTMENT" } }),
    db.holding.findMany(),
    db.note.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
    db.person.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
  ]);

  const cashTotal = cashAccounts.reduce(
    (sum, acc) => sum + acc.transactions.reduce((s, t) => s + t.amount, 0),
    0
  );
  const holdingsCost = holdings.reduce((s, h) => s + h.costBasis, 0);
  const holdingsValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const pnl = holdingsValue - holdingsCost;
  const totalAssets = cashTotal + holdingsValue;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">总览</h1>
        <p className="text-muted-foreground text-sm">个人工作台 · 记账 / 读书笔记 / 知识图谱 / 内容采集</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>总资产</CardDescription>
            <CardTitle className="text-2xl">{formatCNY(totalAssets)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            现金 {formatCNY(cashTotal)} + 持仓市值 {formatCNY(holdingsValue)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>持仓浮动盈亏</CardDescription>
            <CardTitle className={`text-2xl ${pnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {pnl >= 0 ? "+" : ""}
              {formatCNY(pnl)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            成本 {formatCNY(holdingsCost)} · {holdings.length} 笔持仓 · {investAccounts.length} 个投资账户
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>知识库规模</CardDescription>
            <CardTitle className="text-2xl">{recentPersons.length > 0 ? "持续积累中" : "待起步"}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <Link href="/notes" className="underline">读书笔记</Link> ·{" "}
            <Link href="/knowledge-graph" className="underline">知识图谱人物</Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">最近读书笔记</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {recentNotes.length === 0 && (
              <p className="text-sm text-muted-foreground">还没有笔记，去 <Link href="/notes" className="underline">读书笔记</Link> 页面写第一篇。</p>
            )}
            {recentNotes.map((n) => (
              <Link key={n.id} href="/notes" className="text-sm hover:underline">
                {n.title}
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">最近人物卡</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {recentPersons.length === 0 && (
              <p className="text-sm text-muted-foreground">还没有人物卡，去 <Link href="/knowledge-graph" className="underline">知识图谱</Link> 页面新建。</p>
            )}
            {recentPersons.map((p) => (
              <Link key={p.id} href={`/knowledge-graph/${p.id}`} className="flex items-center gap-2 text-sm hover:underline">
                {p.name}
                <Badge variant="secondary">{p.category === "INVESTOR" ? "投资" : "行业"}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
