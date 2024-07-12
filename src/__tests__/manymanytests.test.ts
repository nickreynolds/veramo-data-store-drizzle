// import "dotenv/config";
// import { drizzle } from "drizzle-orm/postgres-js";
// import postgres from 'postgres'
// // import { NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
// // import pg from "pg";
// // const { Client } = pg
// // import * as drizzleSchema from "./drizzle/schema";
// import * as schema from "../drizzle/schema";
// import { credentials, messages, credentialsToMessages, identifiers } from "../drizzle/schema";
// import { eq } from "drizzle-orm";
// import { after } from "node:test";

// // const connection = postgres(process.env.DATABASE_URL!)




// function createRandomString(length: number) {
//     const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//     let result = "";
//     for (let i = 0; i < length; i++) {
//         result += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     return result;
// }

// const did1 = "did:123:123123123123"
// const did2 = "did:234:234234234234"
// const did3 = "did:345:345345345345"

// function createRandomCredential(issuerDid: string, subjectDid?: string): typeof credentials.$inferInsert {
//     return {
//         hash: createRandomString(10),
//         raw: createRandomString(10),
//         id: createRandomString(8),
//         issuanceDate: new Date(),
//         context: ['context1', createRandomString(10)],
//         type: ['type1', createRandomString(10)],
//         issuerDid,
//         subjectDid,
//     }

// }

// function createRandomMessage(from?: string, to?: string): typeof messages.$inferInsert {
//     return {
//         raw: createRandomString(10),
//         id: createRandomString(8),
//         saveDate: new Date(),
//         updateDate: new Date(),
//         createdAt: new Date(),
//         type: 'type1',
//         threadId: createRandomString(10),
//         fromDid: from,
//         toDid: to
//     }

// }
// console.log("process.env.DATABASE_URL: ", process.env.DATABASE_URL)

// describe('many many tests', () => {
//     // const db = drizzle(connection, { schema });
//     const connection = postgres(process.env.DATABASE_URL!)

//     // client.connect();

//     const db = drizzle(connection, { schema });

//     beforeAll(async () => {
//         await db.delete(credentialsToMessages)
//         await db.delete(credentials)
//         await db.delete(messages)
//         await db.delete(identifiers)
//     })

//     afterAll(async () => {
//         await db.delete(credentialsToMessages)
//         await db.delete(credentials)
//         await db.delete(messages)
//         await db.delete(identifiers)
//         await connection.end()
//     })

//     test('should save and get message with 1 credential', async () => {
//         // expect(true).toBe(true)
//         const message = createRandomMessage()
//         const credential = createRandomCredential(did1)

//         await db.insert(identifiers).values([{ did: did1, saveDate: new Date(), updateDate: new Date() }])

//         await db.insert(credentials).values([credential])

//         await db.insert(messages).values([message])

//         await db.insert(credentialsToMessages).values([{
//             messageId: message.id,
//             credentialHash: credential.hash
//         }])

//         const messageWithCredential = await db.query.credentialsToMessages.findMany({
//             where: (credentialsToMessages) => eq(credentialsToMessages.messageId, message.id),
//             with: {
//                 credential: true
//             }
//         })

//         expect(messageWithCredential.length).toBe(1)
//         expect(messageWithCredential[0].credential.hash).toBe(credential.hash)
//     })

//     test('should save and get message with 2 credentials', async () => {
//         // expect(true).toBe(true)
//         const message = createRandomMessage()
//         const credential = createRandomCredential(did1)
//         const credential2 = createRandomCredential(did2)

//         await db.insert(identifiers).values([{ did: did2, saveDate: new Date(), updateDate: new Date() }])

//         await db.insert(credentials).values([credential, credential2])

//         await db.insert(messages).values([message])

//         await db.insert(credentialsToMessages).values([{
//             messageId: message.id,
//             credentialHash: credential.hash
//         },
//         {
//             messageId: message.id,
//             credentialHash: credential2.hash
//         }])


//         const messageWithCredential = await db.query.credentialsToMessages.findMany({
//             where: (credentialsToMessages) => eq(credentialsToMessages.messageId, message.id),
//             with: {
//                 credential: true
//             }
//         })

//         expect(messageWithCredential.length).toBe(2)
//         expect(messageWithCredential[0].credential.hash).toBe(credential.hash)
//         expect(messageWithCredential[1].credential.hash).toBe(credential2.hash)

//     })
// })