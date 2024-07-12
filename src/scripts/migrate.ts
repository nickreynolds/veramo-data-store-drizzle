import "dotenv/config";
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from 'postgres'
import * as schema from "../drizzle/schema";

export const connection = postgres(process.env.DATABASE_URL!)

// client.connect();

export const db = drizzle(connection);

// This will run migrations on the database, skipping the ones already applied
await migrate(db, { migrationsFolder: './src/drizzle' });

// Don't forget to close the connection, otherwise the script will hang
await connection.end()