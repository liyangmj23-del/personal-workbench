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
import { createHolding } from "@/lib/actions/finance";

type Account = { id: string; name: string };

export function AddHoldingDialog({ accounts }: { accounts: Account[] }) {
  const [open, setOpen] = useState(false);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" disabled={accounts.length === 0} />}>
        <Plus className="size-4" />
        新增持仓
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增持仓</DialogTitle>
        </DialogHeader>
        <form
          ref={formRef}
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            data.set("accountId", accountId);
            startTransition(async () => {
              await createHolding(data);
              formRef.current?.reset();
              setOpen(false);
            });
          }}
        >
          <div className="flex flex-col gap-2">
            <Label>投资账户</Label>
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
              <Label htmlFor="name">名称</Label>
              <Input id="name" name="name" placeholder="比如：华泰柏瑞质量成长C" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="code">代码（可选）</Label>
              <Input id="code" name="code" placeholder="011452" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="shares">份额/股数</Label>
              <Input id="shares" name="shares" type="number" step="0.0001" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="costBasis">总成本</Label>
              <Input id="costBasis" name="costBasis" type="number" step="0.01" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="currentValue">当前市值</Label>
              <Input id="currentValue" name="currentValue" type="number" step="0.01" required />
            </div>
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
