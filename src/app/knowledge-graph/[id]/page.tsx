import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PersonForm } from "@/components/knowledge-graph/person-form";
import { RelationManager } from "@/components/knowledge-graph/relation-manager";
import { Separator } from "@/components/ui/separator";

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [person, relationsFrom, relationsTo, allPersons] = await Promise.all([
    db.person.findUnique({ where: { id } }),
    db.personRelation.findMany({ where: { fromPersonId: id }, include: { toPerson: true } }),
    db.personRelation.findMany({ where: { toPersonId: id }, include: { fromPerson: true } }),
    db.person.findMany({ where: { id: { not: id } }, select: { id: true, name: true } }),
  ]);
  if (!person) notFound();

  const relations = [
    ...relationsFrom.map((r) => ({ id: r.id, note: r.note, otherPerson: r.toPerson, direction: "from" as const })),
    ...relationsTo.map((r) => ({ id: r.id, note: r.note, otherPerson: r.fromPerson, direction: "to" as const })),
  ];

  return (
    <div className="flex flex-col gap-6">
      <PersonForm person={person} />
      <Separator />
      <div>
        <h2 className="mb-3 text-lg font-semibold">关联人物</h2>
        <RelationManager personId={id} relations={relations} otherPersons={allPersons} />
      </div>
    </div>
  );
}
