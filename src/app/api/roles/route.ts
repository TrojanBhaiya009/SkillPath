import { NextResponse } from "next/server";
import { runCypher } from "@/lib/neo4j";
import { RolesResponseSchema } from "@/lib/schema";

// Fallback roles for demo while import completes
const FALLBACK_ROLES = [
  "AI Engineer",
  "ML Engineer",
  "Data Scientist",
  "Backend Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Mobile Developer",
];

export async function GET() {
  try {
    console.log("Fetching roles from database...");
    const result = await runCypher<{ name: string }>("roles", {} as Record<string, unknown>);
    console.log("Roles result:", result);
    const names = result.map((r) => r.name).sort();
    
    // Use fallback if database is empty
    const roles = names.length > 0 ? names : FALLBACK_ROLES;
    console.log("Roles names:", roles);
    
    const validated = RolesResponseSchema.parse(roles);
    return NextResponse.json(validated);
  } catch (error) {
    console.error("Roles API error:", error);
    const validated = RolesResponseSchema.parse(FALLBACK_ROLES);
    return NextResponse.json(validated);
  }
}