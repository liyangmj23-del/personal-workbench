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
import { useLanguage } from "@/components/language-provider";

type Account = { id: string; name: string };

export function AddHoldingDialog({ accounts }: { accounts: Account[] }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" disabled={accounts.length === 0} />}>
        <Plus className="size-4" />
        {t.fin_add_holding}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.fin_add_holding}</DialogTitle>
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
            <Label>{t.fin_invest_account_label}</Label>
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
              <Label htmlFor="name">{t.fin_col_name}</Label>
              <Input id="name" name="name" placeholder={t.fin_holding_name_placeholder} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="code">{t.fin_holding_code_optional}</Label>
              <Input id="code" name="code" placeholder="011452" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="shares">{t.fin_holding_shares}</Label>
              <Input id="shares" name="shares" type="number" step="0.0001" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="costBasis">{t.fin_holding_cost}</Label>
              <Input id="costBasis" name="costBasis" type="number" step="0.01" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="currentValue">{t.fin_holding_value}</Label>
              <Input id="currentValue" name="currentValue" type="number" step="0.01" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending || !accountId}>
              {pending ? t.fin_saving : t.fin_save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
