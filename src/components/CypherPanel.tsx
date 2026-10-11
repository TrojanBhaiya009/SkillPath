"use client";

import { useState } from "react";

interface CypherPanelProps {
  cypher: { name: string; params: Record<string, unknown> }[];
}

const CYPHER_QUERIES: Record<string, string> = {
  learning_path: `MATCH (r:JobPosting) WHERE toLower(r.title) = toLower($role)
MATCH (r)-[:REQUIRES_SKILL]->(t:Skill) WHERE NOT toLower(t.name) IN $knownLower
OPTIONAL MATCH (p:Skill)-[:HAS_PREREQUISITE*1..4]->(t)
  WHERE NOT toLower(p.name) IN $knownLower
WITH collect(DISTINCT t) + collect(DISTINCT p) AS skills
UNWIND skills AS s
WITH DISTINCT s
OPTIONAL MATCH chain = (a:Skill)-[:HAS_PREREQUISITE*1..4]->(s)
  WHERE NOT toLower(a.name) IN $knownLower
WITH s, coalesce(max(length(chain)), 0) AS depth
OPTIONAL MATCH (c:Course)-[:TEACHES_SKILL]->(s)
WITH s, depth, c ORDER BY c.duration_weeks ASC
WITH s, depth, collect(c)[0] AS course
RETURN s.name AS skill, depth,
       course.title AS course, course.duration_weeks AS weeks
ORDER BY depth, skill`,
  path_edges: `MATCH (a:Skill)-[r:HAS_PREREQUISITE]->(b:Skill)
WHERE a.name IN $skills AND b.name IN $skills
RETURN a.name AS from, b.name AS to,
       coalesce(r.source, "extracted") AS source`,
  skill_gap: `MATCH (r:JobPosting) WHERE toLower(r.title) = toLower($role)
MATCH (r)-[:REQUIRES_SKILL]->(s:Skill)
RETURN s.name AS skill,
       toLower(s.name) IN $knownLower AS known
ORDER BY known, skill`,
};

export function CypherPanel({ cypher }: CypherPanelProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="panel overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between text-left bg-transparent hover:bg-line/30 transition-colors focus-ring"
        aria-expanded={open}
      >
        <span className="font-body-medium text-text">Show Cypher</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="text-muted transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
          aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-line p-4 space-y-4 max-h-[500px] overflow-auto animate-slide-up">
          {cypher.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-body-medium text-signal">{item.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(CYPHER_QUERIES[item.name] || "", "query")}
                    className="text-xs text-muted hover:text-text transition-colors focus-ring px-2 py-1 rounded-[4px]"
                  >
                    {copied === "query" ? "Copied!" : "Copy query"}
                  </button>
                  <button
                    onClick={() => handleCopy(JSON.stringify(item.params, null, 2), "params")}
                    className="text-xs text-muted hover:text-text transition-colors focus-ring px-2 py-1 rounded-[4px]"
                  >
                    {copied === "params" ? "Copied!" : "Copy params"}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <pre className="bg-ink rounded-[6px] p-3 overflow-auto text-xs max-h-64">
                  <code className="font-code text-text">{CYPHER_QUERIES[item.name] || "-- Query not available --"}</code>
                </pre>
                <pre className="bg-ink rounded-[6px] p-3 overflow-auto text-xs max-h-48">
                  <code className="font-code text-text">{JSON.stringify(item.params, null, 2)}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}