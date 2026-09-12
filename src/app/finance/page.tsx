import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { AddAccountDialog } from "@/components/finance/add-account-dialog";
import { AddTransactionDialog } from "@/components/finance/add-transaction-dialog";
import { AddHoldingDialog } from "@/components/finance/add-holding-dialog";
import { UpdateHoldingValueForm } from "@/components/finance/update-holding-value-form";
import { deleteAccount, deleteTransaction, deleteHolding } from "@/lib/actions/finance";

function formatCNY(n: number) {
  return n.toLocaleString("zh-CN", { style: "currency", currency: "CNY", maximumFractionDigits: 2 });
}

export default async function FinancePage() {
  const [accounts, transactions, holdings] = await Promise.all([
    db.account.findMany({ include: { transactions: true }, orderBy: { createdAt: "asc" } }),
    db.transaction.findMany({ include: { account: true }, orderBy: { date: "desc" }, take: 50 }),
    db.holding.findMany({ include: { account: true }, orderBy: { createdAt: "asc" } }),
  ]);

  const cashAccounts = accounts.filter((a) => a.type === "CASH");
  const investAccounts = accounts.filter((a) => a.type === "INVESTMENT");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">记账 & 持仓</h1>
          <p className="text-muted-foreground text-sm">日常流水记账 + 基金/股票持仓看板</p>
        </div>
        <AddAccountDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {accounts.map((acc) => {
          const balance = acc.transactions.reduce((s, t) => s + t.amount, 0);
          return (
            <Card key={acc.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardDescription>{acc.type === "CASH" ? "现金账户" : "投资账户"}</CardDescription>
                  <CardTitle>{acc.name}</CardTitle>
                </div>
                <form action={deleteAccount.bind(null, acc.id)}>
                  <Button variant="ghost" size="icon" type="submit" className="size-7">
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              </CardHeader>
              {acc.type === "CASH" && (
                <CardContent className="text-xl font-semibold">{formatCNY(balance)}</CardContent>
              )}
            </Card>
          );
        })}
        {accounts.length === 0 && (
          <p className="text-sm text-muted-foreground">还没有账户，先建一个吧。</p>
        )}
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">流水</TabsTrigger>
          <TabsTrigger value="holdings">持仓</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="flex flex-col gap-4">
          <div className="flex justify-end">
            <AddTransactionDialog accounts={cashAccounts.map((a) => ({ id: a.id, name: a.name }))} />
          </div>
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日期</TableHead>
                    <TableHead>账户</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>备注</TableHead>
                    <TableHead className="text-right">金额</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.date.toISOString().slice(0, 10)}</TableCell>
                      <TableCell>{t.account.name}</TableCell>
                      <TableCell>{t.category}</TableCell>
                      <TableCell className="text-muted-foreground">{t.note}</TableCell>
                      <TableCell className={`text-right ${t.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {t.amount >= 0 ? "+" : ""}
                        {formatCNY(t.amount)}
                      </TableCell>
                      <TableCell>
                        <form action={deleteTransaction.bind(null, t.id)}>
                          <Button variant="ghost" size="icon" type="submit" className="size-7">
                            <Trash2 className="size-4" />
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))}
                  {transactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        还没有流水记录
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holdings" className="flex flex-col gap-4">
          <div className="flex justify-end">
            <AddHoldingDialog accounts={investAccounts.map((a) => ({ id: a.id, name: a.name }))} />
          </div>
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>账户</TableHead>
                    <TableHead className="text-right">份额</TableHead>
                    <TableHead className="text-right">成本</TableHead>
                    <TableHead className="text-right">市值</TableHead>
                    <TableHead className="text-right">盈亏</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holdings.map((h) => {
                    const pnl = h.currentValue - h.costBasis;
                    const pnlPct = h.costBasis !== 0 ? (pnl / h.costBasis) * 100 : 0;
                    return (
                      <TableRow key={h.id}>
                        <TableCell>
                          {h.name}
                          {h.code && <span className="text-muted-foreground ml-1 text-xs">{h.code}</span>}
                        </TableCell>
                        <TableCell>{h.account.name}</TableCell>
                        <TableCell className="text-right">{h.shares}</TableCell>
                        <TableCell className="text-right">{formatCNY(h.costBasis)}</TableCell>
                        <TableCell className="text-right">
                          <UpdateHoldingValueForm holdingId={h.id} currentValue={h.currentValue} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={pnl >= 0 ? "default" : "destructive"}>
                            {pnl >= 0 ? "+" : ""}
                            {pnlPct.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <form action={deleteHolding.bind(null, h.id)}>
                            <Button variant="ghost" size="icon" type="submit" className="size-7">
                              <Trash2 className="size-4" />
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {holdings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        还没有持仓记录
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
