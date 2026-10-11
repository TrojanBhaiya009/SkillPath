import type { AskResponse } from "./schema";
import { runCypher, lowerCaseArray } from "./neo4j";

export async function askAgent(
  question: string,
  role?: string,
  known?: string[]
): Promise<AskResponse> {
  if (!role && !known?.length) {
    return getRecordedResponse(question);
  }

  try {
    const knownLower = lowerCaseArray(known || []);
    
    // Use learning_path Cypher for "what to learn" questions
    const isPathQuestion = /what (to learn|should i learn|learning path|path|courses|prerequisites)/i.test(question);
    const isGapQuestion = /what (skills|missing|gap)/i.test(question);
    const isRoleQuestion = /which role|what role|role fit|fit my skills/i.test(question);

    let cypherQuery = "";
    let cypherParams: Record<string, unknown> = {};

    if (isPathQuestion && role) {
      cypherQuery = `
MATCH (r:JobPosting) WHERE toLower(r.title) = toLower($role)
MATCH (r)-[:REQUIRES_SKILL]->(t:Skill) WHERE NOT toLower(t.name) IN $knownLower
OPTIONAL MATCH (p:Skill)-[:HAS_PREREQUISITE*1..4]->(t)
  WHERE NOT toLower(p.name) IN $knownLower
WITH collect(DISTINCT t) + collect(DISTINCT p) AS skills
UNWIND skills AS s
WITH DISTINCT s
OPTIONAL MATCH chain = (a:Skill)-[:HAS_PREREQUISITE*1..4]->(s)
  WHERE NOT toLower(a.name) IN $knownLower
WITH s, coalesce(max(length(chain)), 0) AS depth
OPTIONAL MATCH (c:Course)-[:TEACHES_SKILL]->(s)
WITH s, depth, c ORDER BY c.duration_weeks ASC
WITH s, depth, collect(c)[0] AS course
RETURN s.name AS skill, depth,
       course.title AS course, course.duration_weeks AS weeks
ORDER BY depth, skill
      `;
      cypherParams = { role, knownLower };
    } else if (isGapQuestion && role) {
      cypherQuery = `
MATCH (r:JobPosting) WHERE toLower(r.title) = toLower($role)
MATCH (r)-[:REQUIRES_SKILL]->(s:Skill)
RETURN s.name AS skill,
       toLower(s.name) IN $knownLower AS known
ORDER BY known, skill
      `;
      cypherParams = { role, knownLower };
    } else if (isRoleQuestion && known?.length) {
      cypherQuery = `
MATCH (s:Skill) WHERE toLower(s.name) IN $knownLower
MATCH (r:JobPosting)-[:REQUIRES_SKILL]->(s)
RETURN DISTINCT r.title AS role, count(s) AS matchCount
ORDER BY matchCount DESC
LIMIT 5
      `;
      cypherParams = { knownLower };
    } else {
      return getRecordedResponse(question);
    }

    const results = await runCypher<any>(cypherQuery, cypherParams);
    
    if (!results.length) {
      return getRecordedResponse(question);
    }

    // Format answer based on question type
    if (isPathQuestion) {
      const steps = results.slice(0, 10).map((r, i) => 
        `${i + 1}. ${r.skill}${r.course ? ` → ${r.course} (${r.weeks} weeks)` : " → No course"}`
      ).join("\n");
      return { 
        answer: `Here's your learning path for ${role}:\n\n${steps}`, 
        source: "live" 
      };
    } else if (isGapQuestion) {
      const missing = results.filter(r => !r.known).map(r => r.skill).join(", ");
      const knownSkills = results.filter(r => r.known).map(r => r.skill).join(", ");
      return { 
        answer: `For ${role}:\nAlready known: ${knownSkills || "none"}\nMissing: ${missing || "none"}`, 
        source: "live" 
      };
    } else if (isRoleQuestion) {
      const roles = results.map(r => `${r.role} (${r.matchCount} matching skills)`).join("\n");
      return { 
        answer: `Based on your skills, these roles match:\n${roles}`, 
        source: "live" 
      };
    }

    return getRecordedResponse(question);
  } catch (error) {
    console.error("Agent error:", error);
    return getRecordedResponse(question);
  }
}

function getRecordedResponse(question: string): AskResponse {
  const fixtures: Record<string, string> = {
    "what courses teach deep learning":
      "Based on the graph, the following courses teach Deep Learning: 'Deep Learning Specialization' (16 weeks).",
    "which roles fit my skills":
      "The graph suggests these roles match your skills: AI Engineer, ML Engineer, Data Scientist.",
    "what are the prerequisites for machine learning":
      "Prerequisites for Machine Learning: Python, Statistics, Linear Algebra.",
  };

  const lowerQuestion = question.toLowerCase();
  for (const [key, answer] of Object.entries(fixtures)) {
    if (lowerQuestion.includes(key)) {
      return { answer, source: "recorded" };
    }
  }

  return {
    answer: "The agent did not respond. Showing a recorded answer.",
    source: "recorded",
  };
}