import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import * as postgres from 'postgres'
// import { NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
// import pg from "pg";
// const { Client } = pg
// import * as drizzleSchema from "./drizzle/schema";
import * as schema from "../drizzle/schema";
import { credentials, messages, credentialsToMessages } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// const connection = postgres(process.env.DATABASE_URL!)

// const db = drizzle(connection, { schema });
export const connection = postgres(process.env.DATABASE_URL!)

// client.connect();

export const db = drizzle(connection, { schema });


function createRandomString(length: number) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

describe('many many tests', () => {

    beforeAll(async () => {
        await db.delete(credentialsToMessages)
        await db.delete(credentials)
        await db.delete(messages)
    })

    test('should save and get message with 1 credential', async () => {
        // expect(true).toBe(true)
        const messageId = createRandomString(11)
        const credentialHash = createRandomString(10)

        await db.insert(credentials).values([{
            hash: credentialHash,
            raw: createRandomString(100),
            id: createRandomString(10)
        }])

        await db.insert(messages).values([{
            id: messageId,
            raw: createRandomString(100)
        }])

        await db.insert(credentialsToMessages).values([{
            messageId: messageId,
            credentialHash: credentialHash
        }])

        const messageWithCredential = await db.query.credentialsToMessages.findMany({
            where: (credentialsToMessages) => eq(credentialsToMessages.messageId, messageId),
            with: {
                credential: true
            }
        })

        expect(messageWithCredential.length).toBe(1)
        expect(messageWithCredential[0].credential.hash).toBe(credentialHash)
    })

    test('should save and get message with 2 credentials', async () => {
        // expect(true).toBe(true)
        const messageId = createRandomString(11)
        const credentialHash = createRandomString(10)
        const credentialHash2 = createRandomString(10)

        await db.insert(credentials).values([{
            hash: credentialHash,
            raw: createRandomString(100),
            id: createRandomString(10)
        }, {
            hash: credentialHash2,
            raw: createRandomString(100),
            id: createRandomString(10)
        }])

        await db.insert(messages).values([{
            id: messageId,
            raw: createRandomString(100)
        }])

        await db.insert(credentialsToMessages).values([{
            messageId: messageId,
            credentialHash: credentialHash
        },
        {
            messageId: messageId,
            credentialHash: credentialHash2
        }])

        const messageWithCredential = await db.query.credentialsToMessages.findMany({
            where: (credentialsToMessages) => eq(credentialsToMessages.messageId, messageId),
            with: {
                credential: true
            }
        })

        expect(messageWithCredential.length).toBe(2)
        expect(messageWithCredential[0].credential.hash).toBe(credentialHash)
        expect(messageWithCredential[1].credential.hash).toBe(credentialHash2)

    })
})