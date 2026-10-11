import { NextResponse } from "next/server";
import { runCypher } from "@/lib/neo4j";
import { SkillsResponseSchema } from "@/lib/schema";

export async function GET() {
  try {
    const result = await runCypher<{ name: string }>("skills", {} as Record<string, unknown>);
    const names = result.map((r) => r.name).sort();
    const validated = SkillsResponseSchema.parse(names);
    return NextResponse.json(validated);
  } catch (error) {
    console.error("Skills API error:", error);
    return NextResponse.json([]);
  }
}