import { PersonForm } from "@/components/knowledge-graph/person-form";

export default function NewPersonPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">新建人物卡</h1>
      <PersonForm />
    </div>
  );
}
