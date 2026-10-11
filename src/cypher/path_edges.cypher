MATCH (a:Skill)-[r:HAS_PREREQUISITE]->(b:Skill)
WHERE a.name IN $skills AND b.name IN $skills
RETURN a.name AS from, b.name AS to,
       coalesce(r.source, "extracted") AS source