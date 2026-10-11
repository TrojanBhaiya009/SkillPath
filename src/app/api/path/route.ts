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
    console.log("Path API called with:", { role, known });
    const result = await buildPath(role, known);
    console.log("Path API result steps:", result.steps.length);
    const validated = PathResponseSchema.parse(result);
    return NextResponse.json(validated);
  } catch (error) {
    console.error("Path API error:", error);
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