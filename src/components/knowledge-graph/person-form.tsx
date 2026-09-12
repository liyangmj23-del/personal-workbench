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
      toast.error("先填人物姓名，再贴一段原文");
      return;
    }
    setExtracting(true);
    try {
      const result = await extractPersonFromText(name, sourceText);
      setCoreViews((prev) => (prev ? prev + "\n\n" + result.coreViews : result.coreViews));
      setMethodology((prev) => (prev ? prev + "\n\n" + result.methodology : result.methodology));
      setCases((prev) => (prev ? prev + "\n\n" + result.cases : result.cases));
      toast.success("AI 抽取完成，检查一下再保存");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "抽取失败");
    } finally {
      setExtracting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="人物姓名" className="max-w-sm text-lg font-semibold" />
        <Select value={category} onValueChange={(v) => setCategory((v ?? "INVESTOR") as "INVESTOR" | "INDUSTRY")}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INVESTOR">投资大师</SelectItem>
            <SelectItem value="INDUSTRY">行业人物</SelectItem>
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
          {pending ? "保存中..." : "保存"}
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
        <Label htmlFor="sourceUrl">原始资料链接（可选）</Label>
        <Input id="sourceUrl" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." />
      </div>

      <div className="flex flex-col gap-2 rounded-md border p-3">
        <Label>AI 辅助抽取：贴一段书籍摘录/文章原文，自动填充下面三块</Label>
        <Textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="粘贴原文..."
          className="min-h-24"
        />
        <Button variant="outline" size="sm" onClick={handleExtract} disabled={extracting} className="self-start">
          <Sparkles className="size-4" />
          {extracting ? "抽取中..." : "AI 抽取"}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="coreViews">核心观点</Label>
        <Textarea id="coreViews" value={coreViews} onChange={(e) => setCoreViews(e.target.value)} className="min-h-32 font-mono text-sm" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="methodology">方法论</Label>
        <Textarea id="methodology" value={methodology} onChange={(e) => setMethodology(e.target.value)} className="min-h-32 font-mono text-sm" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="cases">经典案例 / 经历</Label>
        <Textarea id="cases" value={cases} onChange={(e) => setCases(e.target.value)} className="min-h-32 font-mono text-sm" />
      </div>
    </div>
  );
}
