# FEEDBACK.md — SkillPath build log

Format: `HH:MM · worked|confusing|blocked · product · what happened`

10:15 · worked · AuraDB Free · Instance provisioned in under 2 minutes
10:20 · worked · Document Intelligence · Import started successfully with 6 test documents
10:35 · confusing · Document Intelligence · Auto-generated schema merged "React" and "React.js" as separate skills; needed manual merge
10:40 · worked · Cypher · Name review query caught 3 duplicate pairs; merged with plain Cypher
10:45 · worked · Cypher · Seeded 12 prerequisite edges; all marked source: "seeded"
10:50 · worked · Cypher · Constraints created after verifying no duplicates
10:55 · confusing · Aura Agent · External endpoint auth uses Bearer token; not documented in console UI
11:00 · worked · Aura Agent · 5 test questions passed; fixtures saved
11:05 · blocked · Memory Service · API key format unclear; workspace creation flow differs from docs
11:10 · worked · Memory Service · Resolved: API key is workspace-scoped, not user-scoped
11:15 · worked · Next.js · Tailwind v4 @theme tokens working; dark mode locked
11:20 · confusing · PathGraph · SVG text wrapping for long skill names needs refinement
11:25 · worked · Demo · First end-to-end run successful at 1280×720