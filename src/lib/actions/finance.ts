"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createAccount(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "CASH") as "CASH" | "INVESTMENT";
  if (!name) return;

  await db.account.create({ data: { name, type } });
  revalidatePath("/finance");
}

export async function deleteAccount(accountId: string) {
  await db.account.delete({ where: { id: accountId } });
  revalidatePath("/finance");
}

export async function createTransaction(formData: FormData) {
  const accountId = String(formData.get("accountId") ?? "");
  const date = String(formData.get("date") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const category = String(formData.get("category") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim() || null;
  if (!accountId || !date || !category) return;

  await db.transaction.create({
    data: { accountId, date: new Date(date), amount, category, note },
  });
  revalidatePath("/finance");
}

export async function deleteTransaction(transactionId: string) {
  await db.transaction.delete({ where: { id: transactionId } });
  revalidatePath("/finance");
}

export async function createHolding(formData: FormData) {
  const accountId = String(formData.get("accountId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim() || null;
  const shares = Number(formData.get("shares") ?? 0);
  const costBasis = Number(formData.get("costBasis") ?? 0);
  const currentValue = Number(formData.get("currentValue") ?? 0);
  if (!accountId || !name) return;

  await db.holding.create({
    data: { accountId, name, code, shares, costBasis, currentValue },
  });
  revalidatePath("/finance");
}

export async function updateHoldingValue(holdingId: string, currentValue: number) {
  await db.holding.update({ where: { id: holdingId }, data: { currentValue } });
  revalidatePath("/finance");
}

export async function deleteHolding(holdingId: string) {
  await db.holding.delete({ where: { id: holdingId } });
  revalidatePath("/finance");
}
