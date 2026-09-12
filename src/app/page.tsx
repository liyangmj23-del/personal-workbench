import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Wallet, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { getDict } from "@/lib/i18n/get-lang";
import { formatDict } from "@/lib/i18n/dictionary";
import { formatCNY } from "@/lib/format";

function StatIcon({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`flex size-9 items-center justify-center rounded-full ${className}`}>
      {children}
    </div>
  );
}

export default async function DashboardPage() {
  const { t, lang } = await getDict();
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
  const isGain = pnl >= 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.dash_title}</h1>
        <p className="text-muted-foreground text-sm">{t.dash_subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <StatIcon className="bg-pastel-ice text-foreground">
              <Wallet className="size-4" />
            </StatIcon>
            <div>
              <CardDescription>{t.dash_total_assets}</CardDescription>
              <CardTitle className="text-2xl">{formatCNY(totalAssets, lang)}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {formatDict(t.dash_cash_plus_holdings, { cash: formatCNY(cashTotal, lang), value: formatCNY(holdingsValue, lang) })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <StatIcon className={isGain ? "bg-pastel-aqua text-foreground" : "bg-pastel-rose text-foreground"}>
              {isGain ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
            </StatIcon>
            <div>
              <CardDescription>{t.dash_pnl}</CardDescription>
              <CardTitle className={`text-2xl ${isGain ? "text-status-good" : "text-status-bad"}`}>
                {isGain ? "+" : ""}
                {formatCNY(pnl, lang)}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {formatDict(t.dash_pnl_detail, {
              cost: formatCNY(holdingsCost, lang),
              count: holdings.length,
              accounts: investAccounts.length,
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <StatIcon className="bg-pastel-lemon text-foreground">
              <Sparkles className="size-4" />
            </StatIcon>
            <div>
              <CardDescription>{t.dash_kb_size}</CardDescription>
              <CardTitle className="text-2xl">{recentPersons.length > 0 ? t.dash_kb_accumulating : t.dash_kb_start}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <Link href="/notes" className="underline">{t.dash_notes_link}</Link> ·{" "}
            <Link href="/knowledge-graph" className="underline">{t.dash_kg_link}</Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.dash_recent_notes}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {recentNotes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t.dash_no_notes.split("{link}")[0]}
                <Link href="/notes" className="underline">{t.dash_notes_link}</Link>
                {t.dash_no_notes.split("{link}")[1]}
              </p>
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
            <CardTitle className="text-base">{t.dash_recent_persons}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {recentPersons.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t.dash_no_persons.split("{link}")[0]}
                <Link href="/knowledge-graph" className="underline">{t.dash_kg_link}</Link>
                {t.dash_no_persons.split("{link}")[1]}
              </p>
            )}
            {recentPersons.map((p) => (
              <Link key={p.id} href={`/knowledge-graph/${p.id}`} className="flex items-center gap-2 text-sm hover:underline">
                {p.name}
                <Badge className={p.category === "INVESTOR" ? "bg-pastel-ice text-foreground" : "bg-pastel-peach text-foreground"}>
                  {p.category === "INVESTOR" ? t.person_investor : t.person_industry}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
