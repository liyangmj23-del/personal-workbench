import { NoteEditor } from "@/components/notes/note-editor";

export default function NewNotePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">新建笔记</h1>
      <NoteEditor />
    </div>
  );
}
