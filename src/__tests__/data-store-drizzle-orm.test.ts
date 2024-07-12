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
import { asc, gt, gte } from "drizzle-orm";



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
    issuanceDate: "2024-07-01T17:32:07.647Z",
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
    issuanceDate: "2024-07-03T14:40:36.357Z",
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
    issuanceDate: "2024-07-03T22:13:29.771Z",
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
    issuanceDate: "2024-09-03T22:13:29.771Z",
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
        await db.delete(claims);
        await db.delete(credentials);
        await db.delete(messages);
        await db.delete(identifiers);
    });

    afterAll(async () => {
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
        const foundCredentials = await agent.dataStoreORMDrizzleGetVerifiableCredentialsByClaims({
            where: (claims: typeof schema.claims, { eq }: any) => eq(claims.issuerDid, did1)
        });

        expect(foundCredentials.length).toEqual(2);
    })

    test("can save and get credential 4", async () => {
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
        const foundCredentials = await agent.dataStoreORMDrizzleGetVerifiableCredentialsByClaims({
            where: (claims: typeof schema.claims, { eq }: any) => eq(claims.issuerDid, did1)
        });

        expect(foundCredentials.length).toEqual(2);

        const foundCredentials2 = await agent.dataStoreORMDrizzleGetVerifiableCredentialsByClaims({
            where: (claims: typeof schema.claims, { eq }: any) => eq(claims.issuerDid, did2)
        });

        expect(foundCredentials2.length).toEqual(1);
    })

    test("can get verifiable credential by issuer", async () => {
        const agent = makeAgent();
        const allCredentials = await agent.dataStoreORMDrizzleGetVerifiableCredentials({
        });
        const foundCredentials = await agent.dataStoreORMDrizzleGetVerifiableCredentials({
            where: (credentials: typeof schema.credentials, { eq }: any) => eq(credentials.issuerDid, did1)
        });

        expect(allCredentials.length).toEqual(3);
        expect(foundCredentials.length).toEqual(2);
    })

    test("can get verifiable credential with pagination", async () => {
        const agent = makeAgent();
        let cursor: undefined | any = undefined
        const firstCredentials = await agent.dataStoreORMDrizzleGetVerifiableCredentials({
            limit: 1,
            orderBy: (credentials: typeof schema.credentials, { asc }: any) => asc(credentials.issuanceDate),
            where: (credentials: typeof schema.credentials, { lt }: any) => cursor ? lt(credentials.issuanceDate, new Date(cursor)) : undefined
        });

        expect(firstCredentials.length).toEqual(1);
        expect(firstCredentials[0].verifiableCredential.issuer.id).toEqual(did1);
        expect(firstCredentials[0].verifiableCredential.issuanceDate).toEqual(vc1.issuanceDate)

        cursor = firstCredentials[0].verifiableCredential.issuanceDate

        const secondCredentials = await agent.dataStoreORMDrizzleGetVerifiableCredentials({
            limit: 1,
            orderBy: (credentials: typeof schema.credentials, { asc }: any) => asc(credentials.issuanceDate),
            where: (credentials: typeof schema.credentials, { gt }: any) => cursor ? gt(credentials.issuanceDate, new Date(cursor)) : undefined
        });

        expect(secondCredentials.length).toEqual(1);
        expect(secondCredentials[0].verifiableCredential.issuer.id).toEqual(did1);
        expect(secondCredentials[0].verifiableCredential.issuanceDate).toEqual(vc2.issuanceDate)

    })
});
