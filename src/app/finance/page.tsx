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
import { Trash2, Wallet, LineChart } from "lucide-react";
import { AddAccountDialog } from "@/components/finance/add-account-dialog";
import { AddTransactionDialog } from "@/components/finance/add-transaction-dialog";
import { AddHoldingDialog } from "@/components/finance/add-holding-dialog";
import { UpdateHoldingValueForm } from "@/components/finance/update-holding-value-form";
import { deleteAccount, deleteTransaction, deleteHolding } from "@/lib/actions/finance";
import { getDict } from "@/lib/i18n/get-lang";
import { formatCNY } from "@/lib/format";

export default async function FinancePage() {
  const { t, lang } = await getDict();
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
          <h1 className="text-2xl font-semibold">{t.fin_title}</h1>
          <p className="text-muted-foreground text-sm">{t.fin_subtitle}</p>
        </div>
        <AddAccountDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {accounts.map((acc) => {
          const balance = acc.transactions.reduce((s, tx) => s + tx.amount, 0);
          return (
            <Card key={acc.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex size-9 items-center justify-center rounded-full ${acc.type === "CASH" ? "bg-pastel-lemon" : "bg-pastel-ice"} text-foreground`}>
                    {acc.type === "CASH" ? <Wallet className="size-4" /> : <LineChart className="size-4" />}
                  </div>
                  <div>
                    <CardDescription>{acc.type === "CASH" ? t.fin_cash_account : t.fin_invest_account}</CardDescription>
                    <CardTitle>{acc.name}</CardTitle>
                  </div>
                </div>
                <form action={deleteAccount.bind(null, acc.id)}>
                  <Button variant="ghost" size="icon" type="submit" className="size-7">
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              </CardHeader>
              {acc.type === "CASH" && (
                <CardContent className="text-xl font-semibold">{formatCNY(balance, lang)}</CardContent>
              )}
            </Card>
          );
        })}
        {accounts.length === 0 && (
          <p className="text-sm text-muted-foreground">{t.fin_no_accounts}</p>
        )}
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">{t.fin_tab_transactions}</TabsTrigger>
          <TabsTrigger value="holdings">{t.fin_tab_holdings}</TabsTrigger>
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
                    <TableHead>{t.fin_col_date}</TableHead>
                    <TableHead>{t.fin_col_account}</TableHead>
                    <TableHead>{t.fin_col_category}</TableHead>
                    <TableHead>{t.fin_col_note}</TableHead>
                    <TableHead className="text-right">{t.fin_col_amount}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{tx.date.toISOString().slice(0, 10)}</TableCell>
                      <TableCell>{tx.account.name}</TableCell>
                      <TableCell>{tx.category}</TableCell>
                      <TableCell className="text-muted-foreground">{tx.note}</TableCell>
                      <TableCell className={`text-right ${tx.amount >= 0 ? "text-status-good" : "text-status-bad"}`}>
                        {tx.amount >= 0 ? "+" : ""}
                        {formatCNY(tx.amount, lang)}
                      </TableCell>
                      <TableCell>
                        <form action={deleteTransaction.bind(null, tx.id)}>
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
                        {t.fin_no_transactions}
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
                    <TableHead>{t.fin_col_name}</TableHead>
                    <TableHead>{t.fin_col_account}</TableHead>
                    <TableHead className="text-right">{t.fin_col_shares}</TableHead>
                    <TableHead className="text-right">{t.fin_col_cost}</TableHead>
                    <TableHead className="text-right">{t.fin_col_value}</TableHead>
                    <TableHead className="text-right">{t.fin_col_pnl}</TableHead>
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
                        <TableCell className="text-right">{formatCNY(h.costBasis, lang)}</TableCell>
                        <TableCell className="text-right">
                          <UpdateHoldingValueForm holdingId={h.id} currentValue={h.currentValue} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className={pnl >= 0 ? "bg-pastel-aqua text-status-good" : "bg-pastel-rose text-status-bad"}>
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
                        {t.fin_no_holdings}
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
