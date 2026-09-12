"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Anthropic from "@anthropic-ai/sdk";

export async function createPerson(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "INVESTOR") as "INVESTOR" | "INDUSTRY";
  const coreViews = String(formData.get("coreViews") ?? "");
  const methodology = String(formData.get("methodology") ?? "");
  const cases = String(formData.get("cases") ?? "");
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim() || null;
  if (!name) return;

  const person = await db.person.create({
    data: { name, category, coreViews, methodology, cases, sourceUrl },
  });
  revalidatePath("/knowledge-graph");
  redirect(`/knowledge-graph/${person.id}`);
}

export async function updatePerson(personId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const coreViews = String(formData.get("coreViews") ?? "");
  const methodology = String(formData.get("methodology") ?? "");
  const cases = String(formData.get("cases") ?? "");
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim() || null;
  if (!name) return;

  await db.person.update({
    where: { id: personId },
    data: { name, coreViews, methodology, cases, sourceUrl },
  });
  revalidatePath("/knowledge-graph");
  revalidatePath(`/knowledge-graph/${personId}`);
}

export async function deletePerson(personId: string) {
  await db.person.delete({ where: { id: personId } });
  revalidatePath("/knowledge-graph");
  redirect("/knowledge-graph");
}

export async function createRelation(formData: FormData) {
  const fromPersonId = String(formData.get("fromPersonId") ?? "");
  const toPersonId = String(formData.get("toPersonId") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  if (!fromPersonId || !toPersonId || fromPersonId === toPersonId) return;

  await db.personRelation.create({ data: { fromPersonId, toPersonId, note } }).catch(() => {});
  revalidatePath(`/knowledge-graph/${fromPersonId}`);
  revalidatePath("/knowledge-graph");
}

export async function deleteRelation(relationId: string, personId: string) {
  await db.personRelation.delete({ where: { id: relationId } });
  revalidatePath(`/knowledge-graph/${personId}`);
  revalidatePath("/knowledge-graph");
}

const PERSON_EXTRACT_SYSTEM = `你是一个知识整理助手。用户会给你一段书籍摘录或文章原文，以及一个人物姓名。
请把原文中和这个人物相关的内容，严格按下面的JSON结构提炼输出，不要输出任何多余文字：
{"coreViews": "核心观点，markdown格式的要点列表", "methodology": "方法论，markdown格式", "cases": "经典案例/经历，markdown格式"}`;

export async function extractPersonFromText(personName: string, sourceText: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("没配置 ANTHROPIC_API_KEY，去 .env 里填一下");

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 2048,
    system: PERSON_EXTRACT_SYSTEM,
    messages: [
      {
        role: "user",
        content: `人物：${personName}\n\n原文：\n${sourceText}`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "{}";

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : raw) as {
      coreViews: string;
      methodology: string;
      cases: string;
    };
  } catch {
    return { coreViews: raw, methodology: "", cases: "" };
  }
}
