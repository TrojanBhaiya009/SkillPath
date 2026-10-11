"use client";

import { useState, useEffect } from "react";
import { RolePicker } from "@/components/RolePicker";
import { SkillPicker } from "@/components/SkillPicker";
import { PathGraph } from "@/components/PathGraph";
import { StepList } from "@/components/StepList";
import { CypherPanel } from "@/components/CypherPanel";
import { AskPanel } from "@/components/AskPanel";
import { ProvenanceDrawer } from "@/components/ProvenanceDrawer";
import type { PathResponse, GraphNode } from "@/lib/schema";

export default function Planner() {
  const [role, setRole] = useState("");
  const [known, setKnown] = useState<string[]>([]);
  const [pathData, setPathData] = useState<PathResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    fetch("/api/memory")
      .then((r) => r.json())
      .then((data) => {
        if (data?.role) setRole(data.role);
        if (data?.known?.length) setKnown(data.known);
      })
      .catch(() => {});
  }, []);

  const handleFindPath = async () => {
    if (!role) return;
    setLoading(true);
    try {
      const res = await fetch("/api/path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, known }),
      });
      const data = await res.json();
      setPathData(data);
      if (data.steps.length > 0) {
        try {
          await fetch("/api/memory", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role, known }),
          });
        } catch {}
      }
    } catch (error) {
      console.error("Failed to find path:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="max-w-2xl animate-slide-up">
        <h1 className="font-display-bold text-4xl md:text-5xl lg:text-6xl tracking-tight text-text leading-[1.0]">
          Pick a role and the skills you have. See what to learn next, in order.
        </h1>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6 animate-slide-up" style={{ animationDelay: "50ms" }}>
          <div className="panel p-6 space-y-6">
            <RolePicker value={role} onChange={setRole} disabled={loading} />
            <SkillPicker value={known} onChange={setKnown} disabled={loading} role={role} />
            <button
              onClick={handleFindPath}
              disabled={loading || !role}
              className="w-full btn-primary py-3 text-base"
            >
              {loading ? "Finding path..." : "Find my path"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {pathData ? (
            <>
              <div className="animate-slide-up">
                <PathGraph
                  nodes={pathData.nodes}
                  edges={pathData.edges}
                  onNodeClick={setSelectedNode}
                />
              </div>
              <StepList steps={pathData.steps} />
              <CypherPanel cypher={pathData.cypher} />
            </>
          ) : (
            <div className="panel aspect-video flex items-center justify-center animate-fade-in">
              <div className="text-center px-8 max-w-md">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mx-auto mb-4 text-line" aria-hidden="true">
                  <path d="M32 4L32 28M16 28l16 16 16-16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="32" cy="44" r="12" stroke="currentColor" strokeWidth="2" />
                </svg>
                <p className="text-muted text-lg leading-relaxed">
                  Select a role and your known skills, then press{" "}
                  <strong className="text-text">Find my path</strong> to see the learning path.
                </p>
              </div>
            </div>
          )}

          <AskPanel role={role} known={known} />
        </div>
      </div>

      <ProvenanceDrawer
        node={selectedNode}
        nodes={pathData?.nodes || []}
        edges={pathData?.edges || []}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}