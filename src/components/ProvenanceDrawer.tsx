"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { GraphNode, GraphEdge } from "@/lib/schema";

interface ProvenanceDrawerProps {
  node: GraphNode | null;
  nodes: GraphNode[];
  edges: GraphEdge[];
  onClose: () => void;
}

function getStatusClass(state: string) {
  if (state === "known") return "bg-line/50 text-muted";
  return "bg-signal/10 text-signal";
}

function getEdgeSourceClass(source: string) {
  if (source === "seeded") return "bg-signal/10 text-signal";
  return "bg-line/50 text-muted";
}

export function ProvenanceDrawer({ node, nodes, edges, onClose }: ProvenanceDrawerProps) {
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!node || node.label !== "Skill") return null;

  const prerequisiteEdges = edges.filter(
    (e) => e.to === node.id && e.type === "PREREQUISITE_OF"
  );
  const taughtBy = edges.filter((e) => e.to === node.id && e.type === "TEACHES");
  const courseNodes = taughtBy.map((e) => nodes.find((n) => n.id === e.from)).filter(Boolean);

  const content = (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-labelledby="provenance-title"
    >
      <div className="absolute inset-0 bg-ink/80" onClick={onClose} />
      <div className="ml-auto w-full max-w-md bg-panel border-l border-line h-full overflow-auto p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 id="provenance-title" className="font-display-bold text-lg text-text">
            {node.name}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-muted hover:text-text transition-colors rounded-[6px] hover:bg-line focus-ring"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-body-medium text-muted uppercase tracking-wider mb-2">Status</h3>
            <span className={`inline-flex px-2 py-1 pill text-xs font-body-medium ${getStatusClass(node.state)}`}>
              {node.state === "known" ? "Already known" : "To learn"}
            </span>
          </div>

          {prerequisiteEdges.length > 0 && (
            <div>
              <h3 className="text-xs font-body-medium text-muted uppercase tracking-wider mb-2">Prerequisites</h3>
              <ul className="space-y-1">
                {prerequisiteEdges.map((edge, idx) => {
                  const fromNode = nodes.find((n) => n.id === edge.from);
                  return (
                    <li key={idx} className="flex items-center gap-2 text-sm text-text">
                      <span className={`px-1.5 py-0.5 rounded-[4px] text-xs font-code tabular-nums ${getEdgeSourceClass(edge.source)}`}>
                        {edge.source === "seeded" ? "seeded" : "extracted"}
                      </span>
                      {fromNode?.name}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {courseNodes.length > 0 && (
            <div>
              <h3 className="text-xs font-body-medium text-muted uppercase tracking-wider mb-2">Courses</h3>
              <ul className="space-y-1">
                {courseNodes.map((course, idx) => (
                  <li key={idx} className="text-sm text-text">{course?.name}</li>
                ))}
              </ul>
            </div>
          )}

          {prerequisiteEdges.length === 0 && courseNodes.length === 0 && (
            <p className="text-sm text-muted">No provenance data available for this skill.</p>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}