import { NoteEditor } from "@/components/notes/note-editor";
import { getDict } from "@/lib/i18n/get-lang";

export default async function NewNotePage() {
  const { t } = await getDict();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t.notes_new_title}</h1>
      <NoteEditor />
    </div>
  );
}
