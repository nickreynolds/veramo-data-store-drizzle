// // noinspection ES6PreferShortImport
// import "dotenv/config";
// import * as fs from "fs";
// import { Agent } from "@veramo/core";
// import {
//     FindArgs,
//     IDataStore,
//     IDataStoreORM,
//     IMessage,
//     TAgent,
//     TCredentialColumns,
//     TMessageColumns,
//     TPresentationColumns,
//     VerifiableCredential,
//     VerifiablePresentation,
// } from "@veramo/core-types";
// import { computeEntryHash } from "@veramo/utils";
// // import { DataStoreDrizzle } from "../data-store-drizzle";
// // import { DataStoreORM } from "../data-store-orm";
// // import { db } from "../drizzle/db";
// import { claims, credentials, identifiers, messages } from "../drizzle/schema";
// import { DIDStoreDrizzle } from "../identifier/did-store-drizzle";
// import { drizzle } from "drizzle-orm/postgres-js";
// import postgres from 'postgres'
// import * as schema from "../drizzle/schema";



// const did1 = "did:test:111";
// const did2 = "did:test:222";
// const did3 = "did:test:333";
// const did4 = "did:test:444";

// const vc1: VerifiableCredential = {
//     "@context": [
//         "https://www.w3.org/2018/credentials/v1323",
//         "https://www.w3.org/2020/demo/4342323",
//     ],
//     type: ["VerifiableCredential", "PublicProfile"],
//     issuer: { id: did1 },
//     issuanceDate: new Date().toISOString(),
//     id: "vc123",
//     credentialSubject: {
//         id: did2,
//         name: "Ali444ce",
//         profilePicture: "https://example.com/a.png",
//         address: {
//             street: "So11me s3tr.",
//             house: 1,
//         },
//     },
//     proof: {
//         jwt: "mockJWT",
//     },
// };

// const vc2: VerifiableCredential = {
//     "@context": [
//         "https://www.w3.org/2018/credentials/v1323",
//         "https://www.w3.org/2020/demo/4342323",
//     ],
//     type: ["VerifiableCredential", "PublicProfile"],
//     issuer: { id: did1 },
//     issuanceDate: new Date().toISOString(),
//     id: "vc1234vvv",
//     credentialSubject: {
//         id: did3,
//         name: "A555li444ce",
//         profilePicture: "https://example.com/3.png",
//         address: {
//             street: "Some s3tr.",
//             house: 1,
//         },
//     },
//     proof: {
//         jwt: "mockJWT32",
//     },
// };

// const vp1: VerifiablePresentation = {
//     "@context": [
//         "https://www.w3.org/2018/credentials/v1323",
//         "https://www.w3.org/2020/demo/4342323",
//     ],
//     type: ["VerifiablePresentation", "PublicProfile"],
//     holder: did1,
//     verifier: [did2],
//     issuanceDate: new Date().toISOString(),
//     verifiableCredential: [vc1],
//     proof: {
//         jwt: "mockJWT",
//     },
// };

// const vp2: VerifiablePresentation = {
//     "@context": [
//         "https://www.w3.org/2018/credentials/v1323",
//         "https://www.w3.org/2020/demo/4342323",
//     ],
//     type: ["VerifiablePresentation", "PublicProfileMultiAudience"],
//     holder: did1,
//     verifier: [did2, did4],
//     issuanceDate: new Date().toISOString(),
//     verifiableCredential: [vc1],
//     proof: {
//         jwt: "mockJWT",
//     },
// };

// const m1: IMessage = {
//     id: "m1",
//     from: did1,
//     to: did2,
//     createdAt: "2020-06-16T11:06:51.680Z",
//     type: "mock",
//     raw: "mock",
//     credentials: [vc1],
//     presentations: [vp1],
// };

// const m2: IMessage = {
//     id: "m2",
//     from: did1,
//     to: did1,
//     createdAt: "2020-06-16T11:07:51.680Z",
//     type: "mock",
//     raw: "mock234",
// };

// const m3: IMessage = {
//     id: "m3",
//     from: did3,
//     to: did2,
//     createdAt: "2020-06-16T11:08:51.680Z",
//     type: "mock",
//     raw: "mock678",
// };

// const m4: IMessage = {
//     id: "m4",
//     from: did1,
//     to: did2,
//     createdAt: "2020-06-16T11:09:51.680Z",
//     type: "mock",
//     raw: "mockmoreaudienct",
//     credentials: [vc1],
//     presentations: [vp2],
// };

// describe("@veramo/data-store-drizzle queries", () => {
//     const connection = postgres(process.env.DATABASE_URL!)

//     // client.connect();

//     const db = drizzle(connection, { schema });
//     // function makeAgent(): TAgent<IDataStore> {
//     // 	// @ts-ignore
//     // 	return new Agent({
//     // 		plugins: [new DataStoreDrizzle()],
//     // 	});
//     // }

//     beforeAll(async () => {
//         // await db.delete(claim);
//         // await db.delete(credential);
//         // await db.delete(message);
//         await db.delete(schema.keys)
//         await db.delete(schema.services)
//         await db.delete(identifiers);

//     });

//     afterAll(async () => {
//         // await db.delete(claim);
//         // await db.delete(credential);
//         // await db.delete(message);
//         await db.delete(schema.keys)
//         await db.delete(schema.services)
//         await db.delete(identifiers);
//         await connection.end()
//     });

//     test("can add and get DID from DID Store", async () => {
//         const didStore = new DIDStoreDrizzle(db);
//         await didStore.importDID({
//             did: did1,
//             alias: "alice",
//             provider: "did:ethr:rinkeby",
//             keys: [],
//             services: [],
//         });
//         const foundDID = await didStore.getDID({
//             did: did1,
//             alias: "",
//             provider: "",
//         });
//         expect(foundDID).toBeDefined();
//     });

//     test("bad DID fails", async () => {
//         const didStore = new DIDStoreDrizzle(db);
//         await expect(
//             didStore.getDID({
//                 did: "did:pkh:eip155:84532:bad",
//                 alias: "",
//                 provider: "",
//             }),
//         ).rejects.toThrow();
//     });

//     test('can add and get DID with services from DID Store', async () => {
//         const didStore = new DIDStoreDrizzle(db);
//         await didStore.importDID({
//             did: did2,
//             alias: "alice4",
//             provider: "did:ethr:rinkeby",
//             keys: [],
//             services: [
//                 {
//                     id: "s1",
//                     type: "Messaging",
//                     serviceEndpoint: "https://example.com",
//                     description: "Some service",
//                 },
//             ],
//         });
//         const foundDID = await didStore.getDID({
//             did: did2,
//             alias: "",
//             provider: "",
//         });
//         expect(foundDID.services.length).toBe(1);
//         expect(foundDID.services[0].id).toBe("s1");
//     })

//     // test("can save and get message", async () => {
//     //     const agent = makeAgent();
//     //     await agent.dataStoreSaveMessage({ message: m1 });
//     //     const foundMessage = await agent.dataStoreGetMessage({ id: "m1" });
//     //     expect(foundMessage).toEqual(m1);
//     // });

//     // test("can save and get credential", async () => {
//     //     const agent = makeAgent();
//     //     await agent.dataStoreSaveVerifiableCredential({
//     //         verifiableCredential: vc2,
//     //     });
//     //     const foundCredential = await agent.dataStoreGetVerifiableCredential({
//     //         hash: computeEntryHash(vc2),
//     //     });

//     //     console.log("foundCredential", foundCredential);

//     //     expect(foundCredential).toEqual(vc2);
//     // });
// });
