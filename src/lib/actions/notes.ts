"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createNote(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  if (!title) return;

  const note = await db.note.create({ data: { title, content } });
  revalidatePath("/notes");
  redirect(`/notes/${note.id}`);
}

export async function updateNote(noteId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  if (!title) return;

  await db.note.update({ where: { id: noteId }, data: { title, content } });
  revalidatePath("/notes");
  revalidatePath(`/notes/${noteId}`);
}

export async function deleteNote(noteId: string) {
  await db.note.delete({ where: { id: noteId } });
  revalidatePath("/notes");
  redirect("/notes");
}
