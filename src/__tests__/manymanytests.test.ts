import "dotenv/config";
// import { drizzle } from "drizzle-orm/postgres-js";
import postgres from 'postgres'
import { NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
const { Client } = pg
// import * as drizzleSchema from "./drizzle/schema";
import * as schema from "../drizzle/schema";
import { credentials, messages, credentialsToMessages } from "../drizzle/schema";

// const connection = postgres(process.env.DATABASE_URL!)

// const db = drizzle(connection, { schema });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

client.connect();

const db = drizzle(client, { schema });

describe('many many tests', async () => {
    test('should get message with credentials', async () => {
        // expect(true).toBe(true)

        await db.insert(credentials).values([{
            hash: '123',
            raw: 'hello',
            id: '123'
        }])

        console.log("something??")
    })
})