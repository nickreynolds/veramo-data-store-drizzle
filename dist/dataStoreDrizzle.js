import { schema } from "@veramo/core-types";
import { asArray, computeEntryHash } from "@veramo/utils";
import { eq } from "drizzle-orm";
import { createCredentialAndClaimsInsertObjects, createCredentialFromDB, createMessage, } from "./drizzle/helpers";
import { claims, credentials, identifiers, messages, presentations, } from "./drizzle/schema";
import * as drizzleSchema from "./drizzle/schema";
export class DataStoreDrizzle {
    methods;
    schema = schema.IDataStore;
    db;
    constructor(db) {
        this.methods = {
            dataStoreSaveMessage: this.dataStoreSaveMessage.bind(this),
            dataStoreGetMessage: this.dataStoreGetMessage.bind(this),
            dataStoreDeleteMessage: this.dataStoreDeleteMessage.bind(this),
            dataStoreDeleteVerifiableCredential: this.dataStoreDeleteVerifiableCredential.bind(this),
            dataStoreSaveVerifiableCredential: this.dataStoreSaveVerifiableCredential.bind(this),
            dataStoreGetVerifiableCredential: this.dataStoreGetVerifiableCredential.bind(this),
            dataStoreSaveVerifiablePresentation: this.dataStoreSaveVerifiablePresentation.bind(this),
            dataStoreGetVerifiablePresentation: this.dataStoreGetVerifiablePresentation.bind(this),
            dataStoreSaveVerifiableCredentialWithWitnessIndex: this.dataStoreSaveVerifiableCredentialWithWitnessIndex.bind(this),
        };
        this.db = db;
    }
    async dataStoreSaveMessage(args) {
        // const message = await (await getConnectedDb(this.dbConnection))
        // 	.getRepository(Message)
        // 	.save(createMessageEntity(args.message));
        const m = {
            id: args.message.id,
            fromDid: args.message.from,
            toDid: args.message.to,
            saveDate: new Date(),
            updateDate: new Date(),
            createdAt: args.message.createdAt
                ? new Date(args.message.createdAt)
                : undefined,
            raw: args.message.raw,
            type: args.message.type,
            replyTo: args.message.replyTo,
            threadId: args.message.threadId,
            data: JSON.stringify(args.message.data),
            // credentials: args.message.credentials,
            // presentations: args.message.presentations,
        };
        const dids = [];
        const messageCreds = [];
        if (args.message.credentials) {
            for (const cred of args.message.credentials) {
                console.log("cred: ", cred);
                console.log("entryHash: ", computeEntryHash(cred));
                const c = {
                    hash: computeEntryHash(cred),
                    raw: JSON.stringify(cred),
                    id: cred.id,
                    type: cred.type ? (Array.isArray(cred.type) ? cred.type : [cred.type]) : [],
                    context: cred["@context"]
                        ? Array.isArray(cred["@context"])
                            ? asArray(cred["@context"])
                            : [cred["@context"]]
                        : [],
                    issuanceDate: new Date(cred.issuanceDate),
                    subjectDid: cred.credentialSubject.id,
                    // biome-ignore lint: ok
                    issuerDid: cred.issuer.id || cred.issuer,
                };
                if (cred.expirationDate) {
                    c.expirationDate = new Date(cred.expirationDate);
                }
                messageCreds.push(c);
                if (!dids.includes(c.issuerDid)) {
                    dids.push(c.issuerDid);
                }
                if (cred.credentialSubject.id &&
                    !dids.includes(cred.credentialSubject.id)) {
                    dids.push(cred.credentialSubject.id);
                }
            }
        }
        const messagePresentations = [];
        if (args.message.presentations) {
            for (const p1 of args.message.presentations) {
                const p = {
                    hash: computeEntryHash(p1),
                    raw: JSON.stringify(p1),
                    type: p1.type ? (Array.isArray(p1.type) ? p1.type : [p1.type]) : [],
                    context: p1["@context"]
                        ? Array.isArray(p1["@context"])
                            ? asArray(p1["@context"])
                            : [p1["@context"]]
                        : [],
                    issuanceDate: p1.issuanceDate ? new Date(p1.issuanceDate) : undefined,
                    expirationDate: p1.expirationDate
                        ? new Date(p1.expirationDate)
                        : undefined,
                    holderDid: p1.holder,
                };
                messagePresentations.push(p);
                if (p.holderDid && !dids.includes(p.holderDid)) {
                    dids.push(p.holderDid);
                }
            }
        }
        console.log("data store save 1.");
        const didsToInsert = dids.map((did) => {
            return { did: did, saveDate: new Date(), updateDate: new Date() };
        });
        await this.db.insert(identifiers).values(didsToInsert).onConflictDoNothing();
        await this.db
            .insert(presentations)
            .values(messagePresentations)
            .onConflictDoNothing();
        await this.db.insert(credentials).values(messageCreds).onConflictDoNothing();
        await this.db.insert(messages).values(m);
        const messageCredentialsCredential = messageCreds.map((c) => {
            return { messageId: m.id, credentialHash: c.hash };
        });
        await this.db
            .insert(drizzleSchema.credentialsToMessages)
            .values(messageCredentialsCredential)
            .onConflictDoNothing();
        const messageCredentialsPresentation = messagePresentations.map((p) => {
            return { messageId: m.id, presentationHash: p.hash };
        });
        await this.db
            .insert(drizzleSchema.messagesToPresentations)
            .values(messageCredentialsPresentation)
            .onConflictDoNothing();
        console.log("data store save end.");
        return args.message.id;
    }
    async dataStoreGetMessage(args) {
        console.log("dataStoreGet.");
        const m = await this.db.query.messages.findFirst({
            where: (message, { eq }) => eq(message.id, args.id),
        });
        if (!m)
            throw new Error("not_found: Message not found");
        console.log("dataStoreGet 2. args.id: ", args.id);
        // this.db.query.
        const m1 = await this.db.query.credentialsToMessages.findMany({
            where: (credentialsToMessages, { eq }) => eq(credentialsToMessages.messageId, args.id),
            with: {
                credential: true,
            },
        });
        if (!m1 || m1.length === 0)
            throw new Error("not_found: Message not found");
        const messageCredentials = m1.map((m) => m.credential);
        const m2 = await this.db.query.messagesToPresentations.findMany({
            where: (messagesToPresentations, { eq }) => eq(messagesToPresentations.messageId, args.id),
            with: {
                presentation: true,
            },
        });
        if (!m2 || m2.length === 0)
            throw new Error("not_found: Message not found");
        const messagePresentations = m2.map((m) => m.presentation);
        const message = createMessage(m, messageCredentials, messagePresentations);
        return message;
    }
    async dataStoreDeleteMessage(args) {
        const m1 = await this.db.query.messages.findFirst({
            where: (message, { eq }) => eq(message.id, args.id),
        });
        if (!m1)
            throw new Error("not_found: Message not found");
        await this.db.delete(messages).where(eq(messages.id, args.id));
        return true;
    }
    async dataStoreDeleteVerifiableCredential(args) {
        const cred = await this.db.query.credentials.findFirst({
            // biome-ignore lint: ok
            where: (credential, { eq }) => eq(credential.hash, args.hash),
        });
        if (!cred)
            throw new Error("not_found: Verifiable credential not found");
        await this.db.delete(claims).where(eq(claims.credentialHash, args.hash));
        await this.db.delete(credentials).where(eq(credentials.hash, args.hash));
        return true;
    }
    async dataStoreSaveVerifiableCredential(args) {
        const { cred, credClaims } = createCredentialAndClaimsInsertObjects(args.verifiableCredential);
        const id1 = await this.db.query.identifiers.findFirst({
            // biome-ignore lint: ok
            where: (identifier, { eq }) => eq(identifier.did, cred.issuerDid),
        });
        console.log("id1: ", id1);
        if (!id1) {
            console.log("insert identifier 1");
            await this.db.insert(identifiers).values({
                did: cred.issuerDid,
                saveDate: new Date(),
                updateDate: new Date(),
            });
        }
        if (cred.subjectDid) {
            const id2 = await this.db.query.identifiers.findFirst({
                // biome-ignore lint: ok
                where: (identifier, { eq }) => eq(identifier.did, cred.subjectDid),
            });
            if (!id2) {
                await this.db.insert(identifiers).values({
                    did: cred.subjectDid,
                    saveDate: new Date(),
                    updateDate: new Date(),
                });
            }
        }
        console.log("entryHash: ", cred.hash);
        await this.db.insert(credentials).values(cred);
        await this.db.insert(claims).values(credClaims);
        return cred.hash;
    }
    async dataStoreSaveVerifiableCredentialWithWitnessIndex(args) {
        const { cred, credClaims } = createCredentialAndClaimsInsertObjects(args.verifiableCredential, args.witnessIndex);
        await this.db.insert(credentials).values(cred);
        await this.db.insert(claims).values(credClaims);
        return cred.hash;
    }
    async dataStoreGetVerifiableCredential(args) {
        const cred = await this.db.query.credentials.findFirst({
            // biome-ignore lint: ok
            where: (credential, { eq }) => eq(credential.hash, args.hash),
        });
        if (!cred)
            throw new Error("not_found: Verifiable credential not found");
        return createCredentialFromDB(cred);
    }
    async dataStoreSaveVerifiablePresentation(args) {
        // const verifiablePresentation = await (
        // 	await getConnectedDb(this.dbConnection)
        // )
        // 	.getRepository(Presentation)
        // 	.save(createPresentationEntity(args.verifiablePresentation));
        // return verifiablePresentation.hash;
        throw new Error("Not implemented");
    }
    async dataStoreGetVerifiablePresentation(args) {
        // const presentationEntity = await (await getConnectedDb(this.dbConnection))
        // 	.getRepository(Presentation)
        // 	.findOneBy({ hash: args.hash });
        // if (!presentationEntity)
        // 	throw new Error("not_found: Verifiable presentation not found");
        // return presentationEntity.raw;
        throw new Error("Not implemented");
    }
}
//# sourceMappingURL=dataStoreDrizzle.js.map