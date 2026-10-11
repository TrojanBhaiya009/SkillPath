import { NextRequest, NextResponse } from "next/server";
import { buildPath } from "@/lib/path";
import { PathRequestSchema, PathResponseSchema } from "@/lib/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = PathRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { role, known } = parsed.data;
    const result = await buildPath(role, known);
    const validated = PathResponseSchema.parse(result);
    return NextResponse.json(validated);
  } catch (error) {
    console.error("Path API error:", error);
    // Return empty path response on failure
    return NextResponse.json({
      role: "",
      steps: [],
      nodes: [],
      edges: [],
      cypher: [],
      ms: 0,
    });
  }
}