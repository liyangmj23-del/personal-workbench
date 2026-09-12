import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { NoteEditor } from "@/components/notes/note-editor";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const note = await db.note.findUnique({ where: { id } });
  if (!note) notFound();

  return (
    <div className="flex flex-col gap-6">
      <NoteEditor note={note} />
    </div>
  );
}
