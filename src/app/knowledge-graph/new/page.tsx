import { PersonForm } from "@/components/knowledge-graph/person-form";
import { getDict } from "@/lib/i18n/get-lang";

export default async function NewPersonPage() {
  const { t } = await getDict();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t.kg_new_title}</h1>
      <PersonForm />
    </div>
  );
}
