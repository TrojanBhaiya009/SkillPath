MATCH (s:Skill)
RETURN toLower(replace(replace(s.name, ".js", ""), " ", "")) AS key,
       collect(s.name) AS names
WHERE size(names) > 1