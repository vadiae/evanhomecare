// @ts-nocheck
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/db/schema.ts",
    dbCredentials: {
        url: "postgresql://neondb_owner:npg_rVea6mWxEG5c@ep-little-lake-ae9sh3k3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    },
});
