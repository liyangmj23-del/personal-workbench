"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import Anthropic from "@anthropic-ai/sdk";

export async function captureFromUrl(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; PersonalWorkbench/1.0)" },
  });
  if (!res.ok) throw new Error(`抓取失败：HTTP ${res.status}`);
  const html = await res.text();

  const dom = new JSDOM(html, { url });
  const article = new Readability(dom.window.document).parse();
  if (!article?.textContent) throw new Error("没抓到正文，可能这个页面需要登录或强JS渲染");

  return saveCapturedSource(url, article.textContent.trim());
}

export async function captureFromText(text: string) {
  if (!text.trim()) throw new Error("文本是空的");
  return saveCapturedSource(null, text.trim());
}

async function saveCapturedSource(url: string | null, rawText: string) {
  const summary = await summarize(rawText).catch(() => null);
  const source = await db.capturedSource.create({
    data: { url, rawText, summary },
  });
  revalidatePath("/capture");
  return source;
}

async function summarize(text: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    system: "用几条要点（markdown列表）总结下面这段内容的核心信息：观点、经历、对行业/产品的看法。只输出要点，不要客套话。",
    messages: [{ role: "user", content: text.slice(0, 20000) }],
  });
  const block = message.content.find((b) => b.type === "text");
  return block && "text" in block ? block.text : null;
}

export async function linkCapturedSourceToPerson(sourceId: string, personId: string) {
  await db.capturedSource.update({ where: { id: sourceId }, data: { personId } });
  revalidatePath("/capture");
}

export async function deleteCapturedSource(sourceId: string) {
  await db.capturedSource.delete({ where: { id: sourceId } });
  revalidatePath("/capture");
}
