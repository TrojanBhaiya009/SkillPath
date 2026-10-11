import { NextResponse } from "next/server";
import { runCypher } from "@/lib/neo4j";
import { SkillsResponseSchema } from "@/lib/schema";

const FALLBACK_SKILLS = [
  "Python", "SQL", "JavaScript", "TypeScript", "React", "Node.js",
  "Machine Learning", "Deep Learning", "Statistics", "Linear Algebra",
  "Git", "Docker", "Kubernetes", "Linux", "AWS", "PostgreSQL",
  "REST APIs", "GraphQL", "Redis", "Kafka", "Microservices",
  "Pandas", "NumPy", "TensorFlow", "PyTorch", "Scikit-learn",
  "HTML", "CSS", "Next.js", "Tailwind CSS", "GitHub Actions",
  "CI/CD", "Terraform", "Prometheus", "Grafana", "Jupyter",
  "Matplotlib", "Seaborn", "Hypothesis Testing", "A/B Testing",
  "Data Visualization", "Feature Engineering", "Model Serving",
  "MLOps", "MLflow", "Kubeflow", "Computer Vision", "NLP",
  "Transformers", "Hugging Face", "Spark", "Airflow", "Tableau",
  "PowerBI", "React Native", "Expo", "Swift", "Kotlin",
  "Android Studio", "Xcode", "Fastlane", "Firebase",
  "System Design", "Software Engineering Fundamentals",
  "Decision Trees", "SVM", "Clustering", "Anomaly Detection",
  "Recommender Systems", "Time Series Analysis", "Go", "Java",
  "Spring Boot", "gRPC", "Elasticsearch", "Vault", "Consul",
  "Istio", "ArgoCD", "Flux", "Cost Optimization", "Security",
  "Authentication", "Authorization", "OAuth", "OIDC", "JWT",
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || undefined;

    console.log("Fetching skills from database...");
    const result = await runCypher<{ name: string }>("skills", {} as Record<string, unknown>);
    console.log("Skills result:", result);
    let names = result.map((r) => r.name);

    // Use fallback if database is empty
    if (names.length === 0) {
      names = FALLBACK_SKILLS;
    }

    // If role specified, sort with role-relevant skills first
    if (role) {
      try {
        const roleSkillsResult = await runCypher<{ name: string }>(
          "role_skills",
          { role } as Record<string, unknown>
        );
        
        const roleSkills = new Set(roleSkillsResult.map((r) => r.name.toLowerCase()));
        
        names.sort((a, b) => {
          const aInRole = roleSkills.has(a.toLowerCase());
          const bInRole = roleSkills.has(b.toLowerCase());
          if (aInRole && !bInRole) return -1;
          if (!aInRole && bInRole) return 1;
          return a.localeCompare(b);
        });
      } catch {
        // If role_skills query fails, just sort alphabetically
        names.sort();
      }
    } else {
      names.sort();
    }

    console.log("Skills names:", names);
    const validated = SkillsResponseSchema.parse(names);
    return NextResponse.json(validated);
  } catch (error) {
    console.error("Skills API error:", error);
    const skills = [...FALLBACK_SKILLS].sort();
    const validated = SkillsResponseSchema.parse(skills);
    return NextResponse.json(validated);
  }
}