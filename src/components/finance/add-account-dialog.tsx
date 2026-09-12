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
import { createAccount } from "@/lib/actions/finance";
import { useLanguage } from "@/components/language-provider";

export function AddAccountDialog() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("CASH");
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Plus className="size-4" />
        {t.fin_new_account}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.fin_new_account}</DialogTitle>
        </DialogHeader>
        <form
          ref={formRef}
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            startTransition(async () => {
              await createAccount(data);
              formRef.current?.reset();
              setOpen(false);
            });
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">{t.fin_account_name}</Label>
            <Input id="name" name="name" placeholder={t.fin_account_name_placeholder} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="type">{t.fin_account_type}</Label>
            <Select value={type} onValueChange={(v) => setType(v ?? "CASH")}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">{t.fin_type_cash}</SelectItem>
                <SelectItem value="INVESTMENT">{t.fin_type_invest}</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="type" value={type} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? t.fin_saving : t.fin_save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
