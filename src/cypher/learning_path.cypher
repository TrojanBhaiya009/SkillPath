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