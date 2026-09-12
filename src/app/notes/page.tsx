import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { getDict } from "@/lib/i18n/get-lang";
import { formatDate } from "@/lib/format";

export default async function NotesPage() {
  const { t, lang } = await getDict();
  const notes = await db.note.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t.notes_title}</h1>
          <p className="text-muted-foreground text-sm">{t.notes_subtitle}</p>
        </div>
        <Button render={<Link href="/notes/new" />} size="sm">
          <Plus className="size-4" />
          {t.notes_new}
        </Button>
      </div>

      {notes.length === 0 && (
        <p className="text-sm text-muted-foreground">{t.notes_none_yet}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((n) => (
          <Link key={n.id} href={`/notes/${n.id}`}>
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardContent>
                <div className="font-medium">{n.title}</div>
                <div className="text-muted-foreground mt-1 line-clamp-3 text-sm">
                  {n.content || t.notes_empty}
                </div>
                <div className="text-muted-foreground mt-2 text-xs">
                  {formatDate(n.updatedAt, lang)}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
