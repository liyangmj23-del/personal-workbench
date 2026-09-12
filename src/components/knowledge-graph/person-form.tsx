"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createPerson, updatePerson, deletePerson, extractPersonFromText } from "@/lib/actions/knowledge-graph";
import { useLanguage } from "@/components/language-provider";

type PersonData = {
  id: string;
  name: string;
  category: "INVESTOR" | "INDUSTRY";
  coreViews: string | null;
  methodology: string | null;
  cases: string | null;
  sourceUrl: string | null;
};

export function PersonForm({ person }: { person?: PersonData }) {
  const { t } = useLanguage();
  const [name, setName] = useState(person?.name ?? "");
  const [category, setCategory] = useState<"INVESTOR" | "INDUSTRY">(person?.category ?? "INVESTOR");
  const [coreViews, setCoreViews] = useState(person?.coreViews ?? "");
  const [methodology, setMethodology] = useState(person?.methodology ?? "");
  const [cases, setCases] = useState(person?.cases ?? "");
  const [sourceUrl, setSourceUrl] = useState(person?.sourceUrl ?? "");
  const [sourceText, setSourceText] = useState("");
  const [pending, startTransition] = useTransition();
  const [extracting, setExtracting] = useState(false);

  function buildFormData() {
    const data = new FormData();
    data.set("name", name);
    data.set("category", category);
    data.set("coreViews", coreViews);
    data.set("methodology", methodology);
    data.set("cases", cases);
    data.set("sourceUrl", sourceUrl);
    return data;
  }

  async function handleExtract() {
    if (!name.trim() || !sourceText.trim()) {
      toast.error(t.kg_extract_need_name_text);
      return;
    }
    setExtracting(true);
    try {
      const result = await extractPersonFromText(name, sourceText);
      setCoreViews((prev) => (prev ? prev + "\n\n" + result.coreViews : result.coreViews));
      setMethodology((prev) => (prev ? prev + "\n\n" + result.methodology : result.methodology));
      setCases((prev) => (prev ? prev + "\n\n" + result.cases : result.cases));
      toast.success(t.kg_extract_done);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t.kg_extract_failed);
    } finally {
      setExtracting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.kg_name_placeholder} className="max-w-sm text-lg font-semibold" />
        <Select value={category} onValueChange={(v) => setCategory((v ?? "INVESTOR") as "INVESTOR" | "INDUSTRY")}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INVESTOR">{t.kg_category_investor}</SelectItem>
            <SelectItem value="INDUSTRY">{t.kg_category_industry}</SelectItem>
          </SelectContent>
        </Select>
        <Button
          disabled={pending || !name.trim()}
          onClick={() =>
            startTransition(async () => {
              const data = buildFormData();
              if (person) await updatePerson(person.id, data);
              else await createPerson(data);
            })
          }
        >
          {pending ? t.fin_saving : t.fin_save}
        </Button>
        {person && (
          <Button
            variant="ghost"
            size="icon"
            disabled={pending}
            onClick={() => startTransition(async () => { await deletePerson(person.id); })}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="sourceUrl">{t.kg_source_url}</Label>
        <Input id="sourceUrl" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." />
      </div>

      <div className="flex flex-col gap-2 rounded-md border p-3">
        <Label>{t.kg_ai_extract_label}</Label>
        <Textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder={t.kg_ai_extract_placeholder}
          className="min-h-24"
        />
        <Button variant="outline" size="sm" onClick={handleExtract} disabled={extracting} className="self-start">
          <Sparkles className="size-4" />
          {extracting ? t.kg_extracting : t.kg_ai_extract_button}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="coreViews">{t.kg_core_views}</Label>
        <Textarea id="coreViews" value={coreViews} onChange={(e) => setCoreViews(e.target.value)} className="min-h-32 font-mono text-sm" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="methodology">{t.kg_methodology}</Label>
        <Textarea id="methodology" value={methodology} onChange={(e) => setMethodology(e.target.value)} className="min-h-32 font-mono text-sm" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="cases">{t.kg_cases}</Label>
        <Textarea id="cases" value={cases} onChange={(e) => setCases(e.target.value)} className="min-h-32 font-mono text-sm" />
      </div>
    </div>
  );
}
