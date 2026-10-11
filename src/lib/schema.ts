import { z } from "zod";

export const PathRequestSchema = z.object({
  role: z.string().min(1),
  known: z.array(z.string()).default([]),
});

export type PathRequest = z.infer<typeof PathRequestSchema>;

export const PathStepSchema = z.object({
  skill: z.string(),
  depth: z.number().int().nonnegative(),
  course: z.object({
    name: z.string(),
    weeks: z.number().int().positive().nullable(),
  }).nullable(),
});

export type PathStep = z.infer<typeof PathStepSchema>;

export const GraphNodeSchema = z.object({
  id: z.string(),
  label: z.enum(["Role", "Skill", "Course"]),
  name: z.string(),
  state: z.enum(["target", "learn", "known", "course"]),
});

export type GraphNode = z.infer<typeof GraphNodeSchema>;

export const GraphEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.enum(["REQUIRES", "PREREQUISITE_OF", "TEACHES"]),
  source: z.enum(["extracted", "seeded"]),
});

export type GraphEdge = z.infer<typeof GraphEdgeSchema>;

export const PathResponseSchema = z.object({
  role: z.string(),
  steps: z.array(PathStepSchema),
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
  cypher: z.array(z.object({
    name: z.string(),
    params: z.record(z.string(), z.unknown()),
  })),
  ms: z.number().int().nonnegative(),
});

export type PathResponse = z.infer<typeof PathResponseSchema>;

export const AskRequestSchema = z.object({
  question: z.string().max(500),
  role: z.string().optional(),
  known: z.array(z.string()).optional(),
});

export type AskRequest = z.infer<typeof AskRequestSchema>;

export const AskResponseSchema = z.object({
  answer: z.string(),
  source: z.enum(["live", "recorded"]),
});

export type AskResponse = z.infer<typeof AskResponseSchema>;

export const ProfileSchema = z.object({
  role: z.string().nullable(),
  known: z.array(z.string()).default([]),
});

export type Profile = z.infer<typeof ProfileSchema>;

export const RolesResponseSchema = z.array(z.string());
export type RolesResponse = z.infer<typeof RolesResponseSchema>;

export const SkillsResponseSchema = z.array(z.string());
export type SkillsResponse = z.infer<typeof SkillsResponseSchema>;