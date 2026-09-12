"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { createTransaction } from "@/lib/actions/finance";

type Account = { id: string; name: string };

export function AddTransactionDialog({ accounts }: { accounts: Account[] }) {
  const [open, setOpen] = useState(false);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [direction, setDirection] = useState<"IN" | "OUT">("OUT");
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" disabled={accounts.length === 0} />}>
        <Plus className="size-4" />
        记一笔
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>记一笔</DialogTitle>
        </DialogHeader>
        <form
          ref={formRef}
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const raw = Number(data.get("amount") ?? 0);
            data.set("amount", String(direction === "OUT" ? -Math.abs(raw) : Math.abs(raw)));
            data.set("accountId", accountId);
            startTransition(async () => {
              await createTransaction(data);
              formRef.current?.reset();
              setOpen(false);
            });
          }}
        >
          <div className="flex flex-col gap-2">
            <Label>账户</Label>
            <Select value={accountId} onValueChange={(v) => setAccountId(v ?? "")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>收/支</Label>
              <Select value={direction} onValueChange={(v) => setDirection((v ?? "OUT") as "IN" | "OUT")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OUT">支出</SelectItem>
                  <SelectItem value="IN">收入</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">金额</Label>
              <Input id="amount" name="amount" type="number" step="0.01" min="0" required />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">日期</Label>
            <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">分类</Label>
            <Input id="category" name="category" placeholder="比如：餐饮 / 工资 / 购物" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="note">备注（可选）</Label>
            <Input id="note" name="note" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending || !accountId}>
              {pending ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
