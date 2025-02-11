import "dotenv/config"; // make sure to install dotenv package
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",
    out: "./src/drizzle",
    schema: "./src/drizzle/schema.ts",
    dbCredentials: {
        // biome-ignore lint: allow non-null
        url: process.env.DATABASE_URL!,
    },
    // Print all statements
    verbose: true,
    // Always ask for confirmation
    strict: true,
});
