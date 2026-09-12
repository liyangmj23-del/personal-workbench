"use client";

import { useEffect, useRef, useState, useTransition } from "react";
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
import { useLanguage } from "@/components/language-provider";
import { categoriesFor } from "@/lib/categories";

type Account = { id: string; name: string };

const CUSTOM_KEY = "__custom__";

export function AddTransactionDialog({ accounts }: { accounts: Account[] }) {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [direction, setDirection] = useState<"IN" | "OUT">("OUT");
  const [category, setCategory] = useState("");
  const [customText, setCustomText] = useState("");
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const categories = categoriesFor(direction);

  useEffect(() => {
    if (accounts.length > 0 && !accounts.some((a) => a.id === accountId)) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  function selectDirection(next: "IN" | "OUT") {
    setDirection(next);
    setCategory("");
    setCustomText("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" disabled={accounts.length === 0} />}>
        <Plus className="size-4" />
        {t.fin_add_transaction}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.fin_add_transaction}</DialogTitle>
        </DialogHeader>
        <form
          ref={formRef}
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const finalCategory = category === CUSTOM_KEY ? customText.trim() : category;
            if (!finalCategory) return;
            const data = new FormData(e.currentTarget);
            const raw = Number(data.get("amount") ?? 0);
            data.set("amount", String(direction === "OUT" ? -Math.abs(raw) : Math.abs(raw)));
            data.set("accountId", accountId);
            data.set("category", finalCategory);
            startTransition(async () => {
              await createTransaction(data);
              formRef.current?.reset();
              setCategory("");
              setCustomText("");
              setOpen(false);
            });
          }}
        >
          <div className="flex flex-col gap-2">
            <Label>{t.fin_select_account}</Label>
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
              <Label>{t.fin_direction}</Label>
              <Select value={direction} onValueChange={(v) => selectDirection((v ?? "OUT") as "IN" | "OUT")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OUT">{t.fin_direction_out}</SelectItem>
                  <SelectItem value="IN">{t.fin_direction_in}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">{t.fin_amount}</Label>
              <Input id="amount" name="amount" type="number" step="0.01" min="0" required />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">{t.fin_date}</Label>
            <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t.fin_category}</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const Icon = c.icon;
                const active = category === c.key;
                return (
                  <Button
                    key={c.key}
                    type="button"
                    size="sm"
                    variant={active ? "default" : "outline"}
                    onClick={() => setCategory(c.key)}
                  >
                    <Icon className="size-4" />
                    {c.label[lang]}
                  </Button>
                );
              })}
              <Button
                type="button"
                size="sm"
                variant={category === CUSTOM_KEY ? "default" : "outline"}
                onClick={() => setCategory(CUSTOM_KEY)}
              >
                {t.fin_category_custom}
              </Button>
            </div>
            {category === CUSTOM_KEY && (
              <Input
                autoFocus
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder={t.fin_category_custom_placeholder}
              />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="note">{t.fin_note_optional}</Label>
            <Input id="note" name="note" />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={pending || !accountId || !(category === CUSTOM_KEY ? customText.trim() : category)}
            >
              {pending ? t.fin_saving : t.fin_save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
