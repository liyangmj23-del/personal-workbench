"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { createRelation, deleteRelation } from "@/lib/actions/knowledge-graph";
import { useLanguage } from "@/components/language-provider";

type OtherPerson = { id: string; name: string };
type RelationItem = {
  id: string;
  note: string | null;
  otherPerson: OtherPerson;
  direction: "from" | "to";
};

export function RelationManager({
  personId,
  relations,
  otherPersons,
}: {
  personId: string;
  relations: RelationItem[];
  otherPersons: OtherPerson[];
}) {
  const { t } = useLanguage();
  const [targetId, setTargetId] = useState(otherPersons[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-3">
      {relations.map((r) => (
        <div key={r.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
          <div>
            {r.direction === "from" ? "→ " : "← "}
            <Link href={`/knowledge-graph/${r.otherPerson.id}`} className="font-medium hover:underline">
              {r.otherPerson.name}
            </Link>
            {r.note && <span className="text-muted-foreground ml-2">{r.note}</span>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            disabled={pending}
            onClick={() => startTransition(async () => { await deleteRelation(r.id, personId); })}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      {relations.length === 0 && <p className="text-muted-foreground text-sm">{t.kg_no_related}</p>}

      {otherPersons.length > 0 && (
        <div className="flex items-center gap-2 pt-2">
          <Select value={targetId} onValueChange={(v) => setTargetId(v ?? "")}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {otherPersons.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.kg_relation_note_placeholder}
            className="max-w-xs"
          />
          <Button
            size="sm"
            variant="outline"
            disabled={pending || !targetId}
            onClick={() =>
              startTransition(async () => {
                const data = new FormData();
                data.set("fromPersonId", personId);
                data.set("toPersonId", targetId);
                data.set("note", note);
                await createRelation(data);
                setNote("");
              })
            }
          >
            <Plus className="size-4" />
            {t.kg_add_relation}
          </Button>
        </div>
      )}
    </div>
  );
}
