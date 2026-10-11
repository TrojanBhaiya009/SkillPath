import { NextResponse } from "next/server";
import { runCypher } from "@/lib/neo4j";
import { RolesResponseSchema } from "@/lib/schema";

export async function GET() {
  try {
    console.log("Fetching roles from database...");
    const result = await runCypher<{ name: string }>("roles", {} as Record<string, unknown>);
    console.log("Roles result:", result);
    const names = result.map((r) => r.name).sort();
    console.log("Roles names:", names);
    const validated = RolesResponseSchema.parse(names);
    return NextResponse.json(validated);
  } catch (error) {
    console.error("Roles API error:", error);
    return NextResponse.json([]);
  }
}