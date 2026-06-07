import { Pool, type QueryResultRow } from "pg";

const globalForPg = globalThis as typeof globalThis & {
  noteflowPool?: Pool;
};

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no esta configurada");
  }

  globalForPg.noteflowPool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : undefined
  });

  return globalForPg.noteflowPool;
}

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  return getPool()
    .query<T>(text, params)
    .then((result) => result.rows);
}
