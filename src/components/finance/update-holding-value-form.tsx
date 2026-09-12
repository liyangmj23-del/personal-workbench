"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateHoldingValue } from "@/lib/actions/finance";

export function UpdateHoldingValueForm({ holdingId, currentValue }: { holdingId: string; currentValue: number }) {
  const [value, setValue] = useState(String(currentValue));
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1">
      <Input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-8 w-28"
      />
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => startTransition(() => updateHoldingValue(holdingId, Number(value)))}
      >
        更新
      </Button>
    </div>
  );
}
