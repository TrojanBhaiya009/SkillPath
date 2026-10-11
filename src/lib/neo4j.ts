import neo4j, { Driver, Record as Neo4jRecord } from "neo4j-driver";
import fs from "fs";
import path from "path";

type CypherParams = Record<string, unknown>;

const uri = process.env.NEO4J_URI!;
const username = process.env.NEO4J_USERNAME!;
const password = process.env.NEO4J_PASSWORD!;
const database = process.env.NEO4J_DATABASE || "neo4j";

let driver: Driver | null = null;

export function getDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  }
  return driver;
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

export async function runCypher<T>(
  fileName: string,
  params: CypherParams = {}
): Promise<T[]> {
  const driver = getDriver();
  const session = driver.session({ database, defaultAccessMode: neo4j.session.READ });
  try {
    const filePath = path.join(process.cwd(), "src", "cypher", `${fileName}.cypher`);
    const query = fs.readFileSync(filePath, "utf-8");
    const result = await session.run(query, params);
    return result.records.map((record: Neo4jRecord) => record.toObject() as T);
  } finally {
    await session.close();
  }
}

export function lowerCaseArray(arr: string[]): string[] {
  return arr.map((s) => s.toLowerCase());
}