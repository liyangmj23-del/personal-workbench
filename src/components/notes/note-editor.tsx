"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownPreview } from "@/components/markdown-preview";
import { Trash2 } from "lucide-react";
import { createNote, updateNote, deleteNote } from "@/lib/actions/notes";
import { useLanguage } from "@/components/language-provider";

export function NoteEditor({
  note,
}: {
  note?: { id: string; title: string; content: string };
}) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [pending, startTransition] = useTransition();

  function handleSave() {
    const data = new FormData();
    data.set("title", title);
    data.set("content", content);
    startTransition(async () => {
      if (note) {
        await updateNote(note.id, data);
      } else {
        await createNote(data);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.notes_title_placeholder}
          className="text-lg font-semibold"
        />
        <Button onClick={handleSave} disabled={pending || !title.trim()}>
          {pending ? t.notes_saving : t.notes_save}
        </Button>
        {note && (
          <Button
            variant="ghost"
            size="icon"
            disabled={pending}
            onClick={() => startTransition(async () => { await deleteNote(note.id); })}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit">{t.notes_edit_tab}</TabsTrigger>
          <TabsTrigger value="preview">{t.notes_preview_tab}</TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.notes_content_placeholder}
            className="min-h-[60vh] font-mono text-sm"
          />
        </TabsContent>
        <TabsContent value="preview" className="rounded-md border p-4 min-h-[60vh]">
          <MarkdownPreview content={content} emptyLabel={t.markdown_empty} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
