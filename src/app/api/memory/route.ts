import { NextRequest, NextResponse } from "next/server";
import { getProfile, saveProfile, clearProfile } from "@/lib/memory";
import { ProfileSchema } from "@/lib/schema";

export async function GET() {
  try {
    const profile = await getProfile();
    if (!profile) {
      return NextResponse.json({ role: null, known: [] });
    }
    const validated = ProfileSchema.parse(profile);
    return NextResponse.json(validated);
  } catch (error) {
    console.error("Memory GET error:", error);
    return NextResponse.json({ role: null, known: [] });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid profile" }, { status: 400 });
    }

    await saveProfile(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Memory PUT error:", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearProfile();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Memory DELETE error:", error);
    return NextResponse.json({ error: "Failed to clear profile" }, { status: 500 });
  }
}