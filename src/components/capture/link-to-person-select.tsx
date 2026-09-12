"use client";

import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { linkCapturedSourceToPerson } from "@/lib/actions/capture";
import { toast } from "sonner";
import { useLanguage } from "@/components/language-provider";

export function LinkToPersonSelect({
  sourceId,
  personId,
  persons,
}: {
  sourceId: string;
  personId: string | null;
  persons: { id: string; name: string }[];
}) {
  const { t } = useLanguage();
  const [value, setValue] = useState(personId ?? "");
  const [, startTransition] = useTransition();

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        const next = v ?? "";
        setValue(next);
        if (!next) return;
        startTransition(async () => {
          await linkCapturedSourceToPerson(sourceId, next);
          toast.success(t.cap_linked);
        });
      }}
    >
      <SelectTrigger className="h-8 w-40 text-xs">
        <SelectValue placeholder={t.cap_link_placeholder} />
      </SelectTrigger>
      <SelectContent>
        {persons.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
