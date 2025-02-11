import {
    IMessage,
    IMetaData,
    VerifiableCredential,
    VerifiablePresentation,
} from "@veramo/core-types";
import { asArray, computeEntryHash, extractIssuer } from "@veramo/utils";
import { claims, credentials, credentialsToMessages, messages, messagesToPresentations, presentations } from "./schema";

export const createMessage = (
    message: typeof messages.$inferSelect,
    messageCredentials: (typeof credentials.$inferSelect)[],
    messagePresentations: (typeof presentations.$inferSelect)[],

): IMessage => {
    const m: Partial<IMessage> = {
        id: message.id,
        type: message.type || undefined,
        raw: message.raw || undefined,
        data: message.data ? JSON.parse(message.data) : undefined,
        metaData: message.metaData
            ? message.metaData.map((m) => JSON.parse(m) as IMetaData)
            : undefined,
    };

    if (message.threadId) {
        m.threadId = message.threadId;
    }

    if (message.replyTo) {
        m.replyTo = message.replyTo;
    }

    if (message.replyTo) {
        m.replyUrl = message.replyUrl || undefined;
    }

    if (message.createdAt) {
        m.createdAt = message.createdAt.toISOString();
    }

    if (message.expiresAt) {
        m.expiresAt = message.expiresAt.toISOString();
    }

    if (message.fromDid) {
        m.from = message.fromDid;
    }

    if (message.toDid) {
        m.to = message.toDid;
    }

    if (messagePresentations) {
        m.presentations = messagePresentations.map((vp) =>
            createPresentationFromDB(vp),
        );
    }

    if (messageCredentials) {
        m.credentials = messageCredentials.map((vc) =>
            createCredentialFromDB(vc),
        );
    }

    return m as IMessage;
};

export const createCredentialFromDB = (
    c: typeof credentials.$inferSelect,
): VerifiableCredential => {
    const vc: VerifiableCredential = JSON.parse(c.raw);
    vc.id = c.id || undefined;
    vc.issuanceDate = c.issuanceDate.toISOString();
    if (c.expirationDate) {
        vc.expirationDate = new Date(c.expirationDate).toISOString();
    }
    vc.type = c.type;
    vc["@context"] = c.context;
    vc.credentialSubject.id = c.subjectDid || undefined;
    return vc;
};

export const createPresentationFromDB = (
    p: typeof presentations.$inferSelect,
): VerifiablePresentation => {
    const vp: VerifiablePresentation = JSON.parse(p.raw);
    vp.id = p.id || undefined;
    vp.issuanceDate = p.issuanceDate?.toISOString() || undefined;
    vp.expirationDate = p.expirationDate?.toISOString() || undefined;
    vp.type = p.type;
    vp["@context"] = p.context;
    // biome-ignore lint: ok
    vp.holder = p.holderDid!;
    return vp;
};

export const createCredentialAndClaimsInsertObjects = (
    vci: VerifiableCredential,
    witnessIndex?: string,
): {
    cred: typeof credentials.$inferInsert;
    credClaims: (typeof claims.$inferInsert)[];
} => {
    const vc = vci;
    const cred: typeof credentials.$inferInsert = {
        context: asArray(vc["@context"]),
        type: asArray(vc.type || []),
        id: vc.id,
        raw: JSON.stringify(vc),
        hash: computeEntryHash(JSON.stringify(vc)) || "",
        issuerDid: extractIssuer(vc),
        issuanceDate: new Date(vc.issuanceDate),
        witnessIndex: witnessIndex ? Number.parseInt(witnessIndex) : undefined,
    };

    if (vc.expirationDate) {
        cred.expirationDate = new Date(vc.expirationDate);
    }

    if (vc.credentialSubject.id) {
        cred.subjectDid = vc.credentialSubject.id;
    }
    const credClaims: (typeof claims.$inferInsert)[] = [];
    for (const type in vc.credentialSubject) {
        // biome-ignore lint: ok
        if (vc.credentialSubject.hasOwnProperty(type)) {
            const value = vc.credentialSubject[type];

            if (type !== "id") {
                const isObj =
                    typeof value === "function" || (typeof value === "object" && !!value);
                const cl1: typeof claims.$inferInsert = {
                    credentialHash: cred.hash,
                    hash: computeEntryHash(JSON.stringify(vc) + type) || "",
                    type: type || "",
                    value: isObj ? JSON.stringify(value) : value,
                    isObj: isObj,
                    issuerDid: cred.issuerDid,
                    subjectDid: cred.subjectDid,
                    expirationDate: cred.expirationDate
                        ? new Date(cred.expirationDate)
                        : undefined,
                    issuanceDate: cred.issuanceDate,
                    credentialType: cred.type,
                    context: cred.context,
                    witnessIndex: witnessIndex
                        ? Number.parseInt(witnessIndex)
                        : undefined,
                };
                credClaims.push(cl1);
            }
        }
    }

    return { cred, credClaims };
};
