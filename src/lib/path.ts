import { runCypher, lowerCaseArray } from "./neo4j";
import type { PathResponse, PathStep, GraphNode, GraphEdge } from "./schema";

function toNumber(val: unknown): number | null {
  if (val == null) return null;
  if (typeof val === "number") return val;
  if (typeof val === "object" && "low" in val) return (val as { low: number }).low;
  return Number(val);
}

export async function buildPath(role: string, known: string[]): Promise<PathResponse> {
  const start = Date.now();
  const knownLower = lowerCaseArray(known);

  const learningPathResult = await runCypher<{ skill: string; depth: number; course: string | null; weeks: number | null }>(
    "learning_path",
    { role, knownLower } as Record<string, unknown>
  );

  const skillNames = learningPathResult.map((r) => r.skill);

  const edgesResult = await runCypher<{ from: string; to: string; source: string }>(
    "path_edges",
    { skills: skillNames } as Record<string, unknown>
  );

  const steps: PathStep[] = learningPathResult.map((r) => ({
    skill: r.skill,
    depth: toNumber(r.depth) ?? 0,
    course: r.course
      ? { name: r.course, weeks: toNumber(r.weeks) }
      : null,
  }));

  const courseNodes = new Map<string, GraphNode>();
  steps
    .filter((s) => s.course)
    .forEach((s) => {
      const name = s.course!.name;
      if (!courseNodes.has(name)) {
        courseNodes.set(name, {
          id: `Course:${name}`,
          label: "Course",
          name,
          state: "course",
        });
      }
    });

  const nodes: GraphNode[] = [
    {
      id: `JobPosting:${role}`,
      label: "Role",
      name: role,
      state: "target",
    },
    ...skillNames.map((skill): GraphNode => ({
      id: `Skill:${skill}`,
      label: "Skill",
      name: skill,
      state: knownLower.includes(skill.toLowerCase()) ? "known" : "learn",
    })),
    ...Array.from(courseNodes.values()),
  ];

  const edges: GraphEdge[] = [
    ...skillNames.map((skill): GraphEdge => ({
      from: `JobPosting:${role}`,
      to: `Skill:${skill}`,
      type: "REQUIRES",
      source: "extracted",
    })),
    ...edgesResult.map((e): GraphEdge => ({
      from: `Skill:${e.from}`,
      to: `Skill:${e.to}`,
      type: "PREREQUISITE_OF",
      source: e.source === "seeded" ? "seeded" : "extracted",
    })),
    ...steps
      .filter((s) => s.course)
      .map((s): GraphEdge => ({
        from: `Course:${s.course!.name}`,
        to: `Skill:${s.skill}`,
        type: "TEACHES",
        source: "extracted",
      })),
  ];

  return {
    role,
    steps,
    nodes,
    edges,
    cypher: [
      { name: "learning_path", params: { role, knownLower } as Record<string, unknown> },
      { name: "path_edges", params: { skills: skillNames } as Record<string, unknown> },
    ],
    ms: Date.now() - start,
  };
}