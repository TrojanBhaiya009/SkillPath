import { NextRequest, NextResponse } from "next/server";
import { askAgent } from "@/lib/agent";
import { AskRequestSchema, AskResponseSchema } from "@/lib/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = AskRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { question, role, known } = parsed.data;
    const result = await askAgent(question, role, known);
    const validated = AskResponseSchema.parse(result);
    return NextResponse.json(validated);
  } catch (error) {
    console.error("Ask API error:", error);
    return NextResponse.json({
      answer: "The agent did not respond. Showing a recorded answer.",
      source: "recorded",
    });
  }
}