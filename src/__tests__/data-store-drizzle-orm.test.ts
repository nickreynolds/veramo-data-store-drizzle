// noinspection ES6PreferShortImport
import "dotenv/config";
import * as fs from "fs";
import { Agent } from "@veramo/core";
import {
    FindArgs,
    IDataStore,
    IDataStoreORM,
    IMessage,
    TAgent,
    TCredentialColumns,
    TMessageColumns,
    TPresentationColumns,
    VerifiableCredential,
    VerifiablePresentation,
} from "@veramo/core-types";
import { computeEntryHash } from "@veramo/utils";
// import { DataStoreDrizzle } from "../data-store-drizzle";
// import { DataStoreORM } from "../data-store-orm";
// import { db } from "../drizzle/db";
import { claims, credentials, identifiers, messages } from "../drizzle/schema";
import { DIDStoreDrizzle } from "../identifier/did-store-drizzle";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from 'postgres'
import * as schema from "../drizzle/schema";
import { DataStoreDrizzleORM } from "../dataStoreDrizzleORM";
import { DataStoreDrizzle } from "../dataStoreDrizzle";



const did1 = "did:test:1112";
const did2 = "did:test:2223";
const did3 = "did:test:3334";
const did4 = "did:test:4445";

const vc1: VerifiableCredential = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1323",
        "https://www.w3.org/2020/demo/4342323",
    ],
    type: ["VerifiableCredential", "PublicProfile"],
    issuer: { id: did1 },
    issuanceDate: new Date().toISOString(),
    id: "vc123",
    credentialSubject: {
        id: did2,
        name: "Ali444ce",
        profilePicture: "https://example.com/a.png",
        address: {
            street: "So11me s3tr.",
            house: 1,
        },
    },
    proof: {
        jwt: "mockJWT12",
    },
};

const vc2: VerifiableCredential = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1323",
        "https://www.w3.org/2020/demo/4342323",
    ],
    type: ["VerifiableCredential", "PublicProfile"],
    issuer: { id: did1 },
    issuanceDate: new Date().toISOString(),
    id: "vc1234vvvUUUUUUU",
    credentialSubject: {
        id: did3,
        name: "A555li444ce",
        profilePicture: "https://example.com/3.png",
        address: {
            street: "Some s3tr.",
            house: 1,
        },
    },
    proof: {
        jwt: "mockJWT32236666666",
    },
};


const vc3: VerifiableCredential = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1323",
        "https://www.w3.org/2020/demo/4342323",
    ],
    type: ["VerifiableCredential", "PublicProfile"],
    issuer: { id: did1 },
    issuanceDate: new Date().toISOString(),
    id: "vc1234vvvUUUUUUU777",
    credentialSubject: {
        id: did3,
        name: "Ae",
        profilePicture: "https://example.com/3.png",
        address: {
            street: "Some s3tr.",
            house: 134,
        },
    },
    proof: {
        jwt: "mockJWT32236666666777",
    },
};


const vc4: VerifiableCredential = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1323",
        "https://www.w3.org/2020/demo/4342323",
    ],
    type: ["VerifiableCredential", "Fakeout"],
    issuer: { id: did2 },
    issuanceDate: new Date().toISOString(),
    id: "vc1234vvvUUUUUUU777",
    credentialSubject: {
        id: did1,
        name: "Ae",
        profilePicture: "https://example.com/3.png",
        address: {
            street: "Some s3tr.",
            house: 134,
        },
    },
    proof: {
        jwt: "moc333kJWT32236666666777",
    },
};

const vp1: VerifiablePresentation = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1323",
        "https://www.w3.org/2020/demo/4342323",
    ],
    type: ["VerifiablePresentation", "PublicProfile"],
    holder: did1,
    verifier: [did2],
    issuanceDate: new Date().toISOString(),
    verifiableCredential: [vc1],
    proof: {
        jwt: "mockJWT12",
    },
};

const vp2: VerifiablePresentation = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1323",
        "https://www.w3.org/2020/demo/4342323",
    ],
    type: ["VerifiablePresentation", "PublicProfileMultiAudience"],
    holder: did1,
    verifier: [did2, did4],
    issuanceDate: new Date().toISOString(),
    verifiableCredential: [vc1],
    proof: {
        jwt: "mockJWT1234",
    },
};

const m1: IMessage = {
    id: "m12",
    from: did1,
    to: did2,
    createdAt: "2020-06-16T11:06:51.680Z",
    type: "mock",
    raw: "mock",
    credentials: [vc1],
    presentations: [vp1],
};

const m2: IMessage = {
    id: "m23",
    from: did1,
    to: did1,
    createdAt: "2020-06-16T11:07:51.680Z",
    type: "mock",
    raw: "mock234",
};

const m3: IMessage = {
    id: "m34",
    from: did3,
    to: did2,
    createdAt: "2020-06-16T11:08:51.680Z",
    type: "mock",
    raw: "mock678",
};

const m4: IMessage = {
    id: "m45",
    from: did1,
    to: did2,
    createdAt: "2020-06-16T11:09:51.680Z",
    type: "mock",
    raw: "mockmoreaudienct",
    credentials: [vc1],
    presentations: [vp2],
};

describe("@veramo/data-store-drizzle queries", () => {
    const connection = postgres(process.env.DATABASE_URL!)

    // client.connect();

    const db = drizzle(connection, { schema });
    function makeAgent(): TAgent<IDataStore> {
        // @ts-ignore
        return new Agent({
            plugins: [new DataStoreDrizzle(db), new DataStoreDrizzleORM(db)],
        });
    }

    beforeAll(async () => {
        console.log("before all?")
        await db.delete(claims);
        await db.delete(credentials);
        await db.delete(messages);
        await db.delete(identifiers);
        console.log("success deleting")
    });

    afterAll(async () => {
        console.log("after all?")
        await db.delete(claims);
        await db.delete(credentials);
        await db.delete(messages);
        await db.delete(identifiers);
        await connection.end()
    });

    test("can save and get credential 1", async () => {
        const agent = makeAgent();
        await agent.dataStoreSaveVerifiableCredential({
            verifiableCredential: vc1,
        });
        const foundCredential = await agent.dataStoreGetVerifiableCredential({
            hash: computeEntryHash(vc1),
        });

        expect(foundCredential).toEqual(vc1);
    });

    test("can save and get credential 2", async () => {
        const agent = makeAgent();
        await agent.dataStoreSaveVerifiableCredential({
            verifiableCredential: vc2,
        });
        const foundCredential = await agent.dataStoreGetVerifiableCredential({
            hash: computeEntryHash(vc2),
        });

        expect(foundCredential).toEqual(vc2);
    });

    test("can get verifiable credentials by claims", async () => {
        const agent = makeAgent();
        const foundCredentials = await agent.dataStoreORMGetVerifiableCredentialsByClaims({
            where: (claims: typeof schema.claims, { eq }: any) => eq(claims.issuerDid, did1)
        });
        console.log("found credentials: ", foundCredentials)

        expect(foundCredentials.length).toEqual(2);
    })

    test("can save and get credential 3", async () => {
        const agent = makeAgent();
        await agent.dataStoreSaveVerifiableCredential({
            verifiableCredential: vc4,
        });
        const foundCredential = await agent.dataStoreGetVerifiableCredential({
            hash: computeEntryHash(vc4),
        });

        expect(foundCredential).toEqual(vc4);
    });

    test("can get verifiable credentials by claims", async () => {
        const agent = makeAgent();
        const foundCredentials = await agent.dataStoreORMGetVerifiableCredentialsByClaims({
            where: (claims: typeof schema.claims, { eq }: any) => eq(claims.issuerDid, did1)
        });
        console.log("found credentials: ", foundCredentials)

        expect(foundCredentials.length).toEqual(2);

        const foundCredentials2 = await agent.dataStoreORMGetVerifiableCredentialsByClaims({
            where: (claims: typeof schema.claims, { eq }: any) => eq(claims.issuerDid, did2)
        });
        console.log("found credentials 2: ", foundCredentials2)

        expect(foundCredentials2.length).toEqual(1);
    })
});
