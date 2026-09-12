import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { MarkdownPreview } from "@/components/markdown-preview";
import { CaptureForm } from "@/components/capture/capture-form";
import { LinkToPersonSelect } from "@/components/capture/link-to-person-select";
import { deleteCapturedSource } from "@/lib/actions/capture";

export default async function CapturePage() {
  const [sources, persons] = await Promise.all([
    db.capturedSource.findMany({ orderBy: { createdAt: "desc" }, include: { person: true } }),
    db.person.findMany({ select: { id: true, name: true } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">内容采集</h1>
        <p className="text-muted-foreground text-sm">
          粘贴链接或文字稿，自动抓正文 + AI提炼要点，可以关联到知识图谱里的人物卡
        </p>
      </div>

      <Card>
        <CardContent>
          <CaptureForm />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {sources.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {s.url && (
                    <a href={s.url} target="_blank" rel="noreferrer" className="text-sm underline">
                      {s.url}
                    </a>
                  )}
                  {s.person && <Badge variant="secondary">{s.person.name}</Badge>}
                  <span className="text-muted-foreground text-xs">
                    {s.createdAt.toLocaleDateString("zh-CN")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <LinkToPersonSelect sourceId={s.id} personId={s.personId} persons={persons} />
                  <form action={deleteCapturedSource.bind(null, s.id)}>
                    <Button variant="ghost" size="icon" type="submit" className="size-7">
                      <Trash2 className="size-4" />
                    </Button>
                  </form>
                </div>
              </div>
              {s.summary ? (
                <MarkdownPreview content={s.summary} />
              ) : (
                <p className="text-muted-foreground text-sm line-clamp-3">{s.rawText}</p>
              )}
            </CardContent>
          </Card>
        ))}
        {sources.length === 0 && (
          <p className="text-muted-foreground text-sm">还没有采集任何内容</p>
        )}
      </div>
    </div>
  );
}
