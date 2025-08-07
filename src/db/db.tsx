import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

if (!process.env.NEXT_PUBLIC_DRIZZLE_DB_URL) {
    console.error("NEXT_PUBLIC_DRIZZLE_DB_URL environment variable is not set");
}

const pool = new Pool({
    connectionString: process.env.NEXT_PUBLIC_DRIZZLE_DB_URL,
});

export const db = drizzle(pool, { schema });

export default db;
