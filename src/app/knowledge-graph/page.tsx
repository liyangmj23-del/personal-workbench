import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { PersonGraph } from "@/components/knowledge-graph/person-graph";

export default async function KnowledgeGraphPage() {
  const [persons, relations] = await Promise.all([
    db.person.findMany({ orderBy: { updatedAt: "desc" } }),
    db.personRelation.findMany(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">知识图谱</h1>
          <p className="text-muted-foreground text-sm">投资大师 + 行业人物的观点/方法论/案例卡片</p>
        </div>
        <Button render={<Link href="/knowledge-graph/new" />} size="sm">
          <Plus className="size-4" />
          新建人物卡
        </Button>
      </div>

      <PersonGraph persons={persons} relations={relations} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {persons.map((p) => (
          <Link key={p.id} href={`/knowledge-graph/${p.id}`}>
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{p.name}</span>
                  <Badge variant="secondary">{p.category === "INVESTOR" ? "投资" : "行业"}</Badge>
                </div>
                <div className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                  {p.coreViews || "还没写核心观点"}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {persons.length === 0 && (
          <p className="text-sm text-muted-foreground">还没有人物卡，点右上角新建。</p>
        )}
      </div>
    </div>
  );
}
