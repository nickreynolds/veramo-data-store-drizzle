import "dotenv/config";
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from 'postgres'
import * as schema from "../drizzle/schema";
import { credentials, messages, credentialsToMessages } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const connection = postgres(process.env.DATABASE_URL!)

// client.connect();

export const db = drizzle(connection, { schema });

// // This will run migrations on the database, skipping the ones already applied
// await migrate(db, { migrationsFolder: './src/drizzle' });

function createRandomString(length: number) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}



const credentialHash = createRandomString(10)
const credentialHash2 = createRandomString(10)
const messageId = createRandomString(11)

await db.insert(credentials).values([{
    hash: credentialHash,
    raw: 'hello',
}])

await db.insert(credentials).values([{
    hash: credentialHash2,
    raw: 'hello4',
}])

await db.insert(messages).values([{
    id: messageId,
    raw: 'hello',
}])

await db.insert(credentialsToMessages).values([{
    messageId: messageId,
    credentialHash: credentialHash,
}])

await db.insert(credentialsToMessages).values([{
    messageId: messageId,
    credentialHash: credentialHash2,
}])

// await db.in

const result = await db.query.credentials.findMany({
    with: {
        credentialsToMessages: true
    }
})
console.log("yep. result: ", JSON.stringify(result))

const result2 = await db.query.credentialsToMessages.findMany({
    with: {
        message: true,
        credential: true
    }
})

console.log("yep. result2: ", JSON.stringify(result2))

const result3 = await db.query.messages.findMany({
    where: (messages) => eq(messages.id, messageId),
    with: {
        credentialsToMessages: true
    }
})
console.log("yep. result3: ", JSON.stringify(result3))


const result4 = await db.query.credentialsToMessages.findMany({
    where: (messages) => eq(credentialsToMessages.messageId, messageId),
    with: {
        credential: true
    }
})
console.log("yep. result4: ", JSON.stringify(result4))

// Don't forget to close the connection, otherwise the script will hang
await connection.end()