import fs from "fs";
import path from "path";

function readCypher(name: string): string {
  try {
    return fs.readFileSync(path.join(process.cwd(), "src", "cypher", `${name}.cypher`), "utf-8");
  } catch {
    return "// File not found";
  }
}

function readFeedback(): string {
  try {
    return fs.readFileSync(path.join(process.cwd(), "FEEDBACK.md"), "utf-8");
  } catch {
    return "No feedback logged yet.";
  }
}

export default function HowItWorks() {
  const learningPathCypher = readCypher("learning_path");
  const pathEdgesCypher = readCypher("path_edges");
  const skillGapCypher = readCypher("skill_gap");
  const feedback = readFeedback();

  return (
    <div className="max-w-4xl space-y-12 animate-fade-in">
      <header className="space-y-2 animate-slide-up">
        <h1 className="font-display-bold text-4xl md:text-5xl tracking-tight text-text">How it works</h1>
        <p className="text-muted">Architecture, data flow, and build feedback.</p>
      </header>

      <section className="space-y-4 animate-slide-up" style={{ animationDelay: "50ms" }}>
        <h2 className="font-display-bold text-2xl text-text">Graph schema</h2>
        <pre className="panel p-4 overflow-auto text-sm">
          <code className="font-code text-text">{
`(:JobPosting   {title})
(:Skill  {name, category?})
(:Course {title, duration_weeks?, provider?})
(:Provider {name})
(:Company {name})
(:__Document__ {name})
(:__Chunk__ {text, embedding})

(:JobPosting)-[:REQUIRES_SKILL]->(:Skill)
(:JobPosting)-[:PREFERS_SKILL]->(:Skill)
(:Skill)-[:HAS_PREREQUISITE {source: "extracted" | "seeded"}]->(:Skill)
(:Course)-[:TEACHES_SKILL]->(:Skill)
(:JobPosting)-[:POSTED_BY]->(:Company)
(:Course)-[:OFFERED_BY]->(:Provider)`
          }
          </code>
        </pre>
      </section>

      <section className="space-y-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
        <h2 className="font-display-bold text-2xl text-text">Cypher templates</h2>

        <div className="space-y-4">
          <h3 className="font-body-medium text-text">skill_gap — which required skills are missing</h3>
          <pre className="panel p-4 overflow-auto text-sm">
            <code className="font-code text-text">{skillGapCypher}</code>
          </pre>
        </div>

        <div className="space-y-4">
          <h3 className="font-body-medium text-text">learning_path — ordered missing skills with a course each</h3>
          <pre className="panel p-4 overflow-auto text-sm">
            <code className="font-code text-text">{learningPathCypher}</code>
          </pre>
        </div>

        <div className="space-y-4">
          <h3 className="font-body-medium text-text">path_edges — links between skills on the path</h3>
          <pre className="panel p-4 overflow-auto text-sm">
            <code className="font-code text-text">{pathEdgesCypher}</code>
          </pre>
        </div>
      </section>

      <section className="space-y-4 animate-slide-up" style={{ animationDelay: "150ms" }}>
        <h2 className="font-display-bold text-2xl text-text">Aura Agent tools</h2>
        <ul className="space-y-2 text-text">
          <li>Cypher Template: <code className="font-code bg-ink px-1.5 py-0.5 rounded-[4px]">skill_gap</code></li>
          <li>Cypher Template: <code className="font-code bg-ink px-1.5 py-0.5 rounded-[4px]">learning_path</code></li>
          <li>Similarity Search on chunk vector index (with connected graph data)</li>
          <li>Text2Cypher for questions the templates do not cover</li>
        </ul>
      </section>

      <section className="space-y-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
        <h2 className="font-display-bold text-2xl text-text">Neo4j products used</h2>
        <ul className="space-y-2 text-text">
          <li>AuraDB Free (graph database)</li>
          <li>Document Intelligence (document → graph import)</li>
          <li>Aura Agent (managed GraphRAG agent)</li>
          <li>Agent Memory Service (learner profile persistence)</li>
          <li>Aura MCP (external agent access — documented only)</li>
        </ul>
      </section>

      <section className="space-y-4 animate-slide-up" style={{ animationDelay: "250ms" }}>
        <h2 className="font-display-bold text-2xl text-text">Aura MCP connection (documentation)</h2>
        <p className="text-muted">Add this to an MCP client (Claude Desktop, Cursor) to query the same graph:</p>
        <pre className="panel p-4 overflow-auto text-sm">
          <code className="font-code text-text">{
`{
  "mcpServers": {
    "skillpath-aura": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/inspector"],
      "env": {
        "MCP_URL": "https://<INSTANCE_ID>.mcp-instances.neo4j.io"
      }
    }
  }`
          }
          </code>
        </pre>
        <p className="text-muted text-sm">Replace <code className="font-code bg-ink px-1.5 py-0.5 rounded-[4px]">{"<INSTANCE_ID>"}</code> with your Aura instance ID.</p>
      </section>

      <section className="space-y-4 animate-slide-up" style={{ animationDelay: "300ms" }}>
        <h2 className="font-display-bold text-2xl text-text">Build feedback</h2>
        <pre className="panel p-4 overflow-auto text-sm max-h-96">
          <code className="font-code text-text whitespace-pre-wrap">{feedback}</code>
        </pre>
      </section>
    </div>
  );
}