MATCH (r:JobPosting) WHERE toLower(r.title) = toLower($role)
MATCH (r)-[:REQUIRES_SKILL]->(s:Skill)
RETURN s.name AS name