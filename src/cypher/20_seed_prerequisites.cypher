UNWIND [
  ["HTML","CSS"], ["CSS","JavaScript"], ["JavaScript","React"],
  ["Python","Machine Learning"], ["Statistics","Machine Learning"],
  ["Linear Algebra","Machine Learning"], ["Machine Learning","Deep Learning"],
  ["Deep Learning","Computer Vision"], ["Deep Learning","NLP"],
  ["Git","CI/CD"], ["Linux","Docker"], ["Docker","Kubernetes"]
] AS pair
MATCH (a:Skill {name: pair[0]}), (b:Skill {name: pair[1]})
MERGE (a)-[r:HAS_PREREQUISITE]->(b)
ON CREATE SET r.source = "seeded"