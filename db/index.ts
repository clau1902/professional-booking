import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  connection: postgres.Sql | undefined;
};

const connection =
  globalForDb.connection ??
  postgres((process.env.POSTGRES_URL ?? process.env.DATABASE_URL)!, { max: 10 });

globalForDb.connection = connection;

export const db = drizzle(connection, { schema });
