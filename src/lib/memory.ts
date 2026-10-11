import type { Profile } from "./schema";

const BASE_URL = process.env.NAMS_BASE_URL || "https://memory.neo4jlabs.com";
const API_KEY = process.env.NAMS_API_KEY;
const LEARNER_ID = "demo-learner";

async function request<T>(method: string, path: string, body?: unknown): Promise<T | null> {
  if (!API_KEY) return null;

  try {
    const response = await fetch(`${BASE_URL}/api/v1${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) return null;
    if (response.status === 204) return null as T;
    return response.json();
  } catch {
    return null;
  }
}

export async function getProfile(): Promise<Profile | null> {
  return request<Profile>("GET", `/learners/${LEARNER_ID}/profile`);
}

export async function saveProfile(profile: Profile): Promise<void> {
  await request("PUT", `/learners/${LEARNER_ID}/profile`, profile);
}

export async function clearProfile(): Promise<void> {
  await request("DELETE", `/learners/${LEARNER_ID}/profile`);
}