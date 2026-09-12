"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";

type PersonNode = { id: string; name: string; category: "INVESTOR" | "INDUSTRY" };
type Relation = { id: string; fromPersonId: string; toPersonId: string; note: string | null };

export function PersonGraph({
  persons,
  relations,
  emptyLabel,
}: {
  persons: PersonNode[];
  relations: Relation[];
  emptyLabel: string;
}) {
  const router = useRouter();

  const nodes: Node[] = useMemo(() => {
    const radius = Math.max(160, persons.length * 30);
    return persons.map((p, i) => {
      const angle = (2 * Math.PI * i) / Math.max(persons.length, 1);
      return {
        id: p.id,
        position: {
          x: radius + radius * Math.cos(angle),
          y: radius + radius * Math.sin(angle),
        },
        data: { label: p.name },
        style: {
          background: p.category === "INVESTOR" ? "#bbd7e8" : "#e7b79c",
          color: "#3a3733",
          border: "1px solid #dcdcd2",
          borderRadius: 8,
          padding: 8,
          fontSize: 12,
        },
      };
    });
  }, [persons]);

  const edges: Edge[] = useMemo(
    () =>
      relations.map((r) => ({
        id: r.id,
        source: r.fromPersonId,
        target: r.toPersonId,
        label: r.note ?? undefined,
        animated: false,
      })),
    [relations]
  );

  if (persons.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[400px] items-center justify-center text-sm">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div style={{ height: 480 }} className="rounded-md border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={(_, node) => router.push(`/knowledge-graph/${node.id}`)}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
