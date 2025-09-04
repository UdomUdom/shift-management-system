import * as schema from "./schema/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ??
  (() => {
    throw new Error("DATABASE_URL is not defined");
  })();

const pool = new Pool({ connectionString });
const dbInstance = drizzle(pool, { schema });

export const db = dbInstance;
export default dbInstance;
