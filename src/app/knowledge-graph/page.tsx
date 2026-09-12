import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { PersonGraph } from "@/components/knowledge-graph/person-graph";
import { getDict } from "@/lib/i18n/get-lang";

export default async function KnowledgeGraphPage() {
  const { t } = await getDict();
  const [persons, relations] = await Promise.all([
    db.person.findMany({ orderBy: { updatedAt: "desc" } }),
    db.personRelation.findMany(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t.kg_title}</h1>
          <p className="text-muted-foreground text-sm">{t.kg_subtitle}</p>
        </div>
        <Button render={<Link href="/knowledge-graph/new" />} size="sm">
          <Plus className="size-4" />
          {t.kg_new}
        </Button>
      </div>

      <PersonGraph persons={persons} relations={relations} emptyLabel={t.kg_graph_empty} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {persons.map((p) => (
          <Link key={p.id} href={`/knowledge-graph/${p.id}`}>
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{p.name}</span>
                  <Badge className={p.category === "INVESTOR" ? "bg-pastel-ice text-foreground" : "bg-pastel-peach text-foreground"}>
                    {p.category === "INVESTOR" ? t.person_investor : t.person_industry}
                  </Badge>
                </div>
                <div className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                  {p.coreViews || t.kg_no_views_yet}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {persons.length === 0 && (
          <p className="text-sm text-muted-foreground">{t.kg_none_yet}</p>
        )}
      </div>
    </div>
  );
}
