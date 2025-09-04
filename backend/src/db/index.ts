import * as schema from "./schema/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ??
  (() => {
    throw new Error("DATABASE_URL is not defined");
  })();

export const db = drizzle(new Pool({ connectionString }), { schema });

export default drizzle(new Pool({ connectionString }), { schema });
