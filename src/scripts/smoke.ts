const BASE = "http://localhost:3000";

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function smoke() {
  console.log("Running smoke tests...\n");

  try {
    console.log("GET /api/roles");
    const roles = await fetchJson(`${BASE}/api/roles`);
    console.log(`  ✓ ${roles.length} roles: ${roles.slice(0, 5).join(", ")}${roles.length > 5 ? "..." : ""}\n`);

    console.log("GET /api/skills");
    const skills = await fetchJson(`${BASE}/api/skills`);
    console.log(`  ✓ ${skills.length} skills: ${skills.slice(0, 5).join(", ")}${skills.length > 5 ? "..." : ""}\n`);

    const testCases = [
      { role: "AI Engineer", known: ["Python", "SQL"] },
      { role: "Backend Developer", known: ["JavaScript", "Git"] },
      { role: "Data Scientist", known: ["Python", "Statistics"] },
    ];

    for (const { role, known } of testCases) {
      console.log(`POST /api/path (role: ${role}, known: [${known.join(", ")}])`);
      const path = await fetchJson(`${BASE}/api/path`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, known }),
      });
      console.log(`  ✓ ${path.steps.length} steps, ${path.nodes.length} nodes, ${path.edges.length} edges (${path.ms}ms)`);
      path.steps.forEach((s: { skill: string; depth: number; course: { name: string; weeks: number } | null }, i: number) => {
        const courseStr = s.course ? ` → ${s.course.name} (${s.course.weeks}w)` : " → No course";
        console.log(`    ${i + 1}. ${s.skill} (depth ${s.depth})${courseStr}`);
      });
      console.log("");
    }

    console.log("All smoke tests passed!");
  } catch (error) {
    console.error("✗ Smoke test failed:", error);
    process.exit(1);
  }
}

smoke();