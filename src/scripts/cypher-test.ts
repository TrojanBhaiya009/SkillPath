import "dotenv/config";
import { runCypher } from "@/lib/neo4j";

const testRoles = ["AI Engineer", "Backend Developer", "Data Scientist"];
const testKnown = [["Python", "SQL"], ["JavaScript", "Git"], ["Python", "Statistics"]];

async function test() {
  console.log("Running Cypher tests...\n");

  for (let i = 0; i < testRoles.length; i++) {
    const role = testRoles[i];
    const known = testKnown[i];
    const knownLower = known.map((s) => s.toLowerCase());

    console.log(`Testing role: ${role}, known: [${known.join(", ")}]`);

    try {
      const result = await runCypher<{ skill: string; depth: number; course: string | null; weeks: number | null }>(
        "learning_path",
        { role, knownLower } as Record<string, unknown>
      );

      if (result.length === 0) {
        console.log("  ⚠️  No results returned\n");
        continue;
      }

      console.log(`  ✓ ${result.length} steps returned`);
      result.forEach((r, idx) => {
        const courseStr = r.course ? ` → ${r.course} (${r.weeks} weeks)` : " → No course";
        console.log(`    ${idx + 1}. ${r.skill} (depth ${r.depth})${courseStr}`);
      });
      console.log("");
    } catch (error) {
      console.error(`  ✗ Error:`, error);
      console.log("");
      process.exit(1);
    }
  }

  console.log("All Cypher tests passed!");
}

test().catch((e) => {
  console.error(e);
  process.exit(1);
});