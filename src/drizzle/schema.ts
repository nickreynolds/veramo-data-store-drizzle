import { relations, sql } from "drizzle-orm";
import {
    bigint,
    boolean,
    index,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uniqueIndex,
    varchar,
} from "drizzle-orm/pg-core";


export const identifiers = pgTable(
    "identifiers",
    {
        did: varchar("did").primaryKey().notNull(),
        provider: varchar("provider"),
        alias: varchar("alias"),
        saveDate: timestamp("saveDate", { mode: "date" }).notNull(),
        updateDate: timestamp("updateDate", { mode: "date" }).notNull(),
        controllerKeyId: varchar("controllerKeyId"),
    },
    (table) => {
        return {
            IDX_6098cca69c838d91e55ef32fe1: uniqueIndex(
                "IDX_6098cca69c838d91e55ef32fe1",
            ).on(table.provider, table.alias),
        };
    },
);

export const claims = pgTable("claims", {
    hash: varchar("hash").primaryKey().notNull(),
    issuanceDate: timestamp("issuanceDate", { mode: "date" }).notNull(),
    expirationDate: timestamp("expirationDate", { mode: "date" }),
    context: text("context").array().notNull(),
    credentialType: text("credentialType").array().notNull(),
    value: text("value").notNull(),
    type: varchar("type").notNull(),
    isObj: boolean("isObj").notNull(),
    issuerDid: varchar("issuerDid").references(() => identifiers.did, {
        onDelete: "cascade",
    }),
    subjectDid: varchar("subjectDid").references(() => identifiers.did),
    credentialHash: varchar("credentialHash")
        .notNull()
        .references(() => credentials.hash, { onDelete: "cascade" }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    witnessIndex: bigint("witnessIndex", { mode: "number" }),
});

export const messages = pgTable("messages", {
    id: varchar("id").primaryKey().notNull(),
    saveDate: timestamp("saveDate", { mode: "date" }).notNull(),
    updateDate: timestamp("updateDate", { mode: "date" }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }),
    expiresAt: timestamp("expiresAt", { mode: "date" }),
    threadId: varchar("threadId"),
    type: varchar("type"),
    raw: varchar("raw"),
    data: text("data"),
    replyTo: text("replyTo").array(),
    replyUrl: varchar("replyUrl"),
    metaData: text("metaData").array(),
    fromDid: varchar("fromDid").references(() => identifiers.did),
    toDid: varchar("toDid").references(() => identifiers.did),
});

export const credentials = pgTable("credentials", {
    hash: varchar("hash").primaryKey().notNull(),
    raw: text("raw").notNull(),
    id: varchar("id"),
    issuanceDate: timestamp("issuanceDate", { mode: "date" }).notNull(),
    expirationDate: timestamp("expirationDate", { mode: "date" }),
    context: text("context").array().notNull(),
    type: text("type").array().notNull(),
    issuerDid: varchar("issuerDid")
        .notNull()
        .references(() => identifiers.did, { onDelete: "cascade" }),
    subjectDid: varchar("subjectDid").references(() => identifiers.did),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    witnessIndex: bigint("witnessIndex", { mode: "number" }),
});

export const presentations = pgTable("presentations", {
    hash: varchar("hash").primaryKey().notNull(),
    raw: text("raw").notNull(),
    id: varchar("id"),
    issuanceDate: timestamp("issuanceDate", { mode: "date" }),
    expirationDate: timestamp("expirationDate", { mode: "date" }),
    context: text("context").array().notNull(),
    type: text("type").array().notNull(),
    holderDid: varchar("holderDid").references(() => identifiers.did, {
        onDelete: "cascade",
    }),
});

export const keys = pgTable("keys", {
    kid: varchar("kid").primaryKey().notNull(),
    kms: varchar("kms").notNull(),
    type: varchar("type").notNull(),
    publicKeyHex: varchar("publicKeyHex").notNull(),
    meta: text("meta"),
    identifierDid: varchar("identifierDid"),
});


export const services = pgTable("services", {
    id: varchar("id").primaryKey().notNull(),
    type: varchar("type").notNull(),
    serviceEndpoint: varchar("serviceEndpoint").notNull(),
    description: varchar("description"),
    identifierDid: varchar("identifierDid"),
});

export const privateKeys = pgTable("private_keys", {
    alias: varchar("alias").primaryKey().notNull(),
    type: varchar("type").notNull(),
    privateKeyHex: varchar("privateKeyHex").notNull(),
});


export const keyvaluestore = pgTable(
    "keyvaluestore",
    {
        key: varchar("key").primaryKey().notNull(),
        data: text("data").notNull(),
    },
    (table) => {
        return {
            IDX_f4824d8a354cbf404f1cbebe02: uniqueIndex(
                "IDX_f4824d8a354cbf404f1cbebe02",
            ).on(table.key),
        };
    },
);

export const credentialsToMessages = pgTable(
    "credentials_to_messages",
    {
        messageId: varchar("message_id")
            .notNull()
            .references(() => messages.id, { onDelete: "cascade" }),
        credentialHash: varchar("credential_hash")
            .notNull()
            .references(() => credentials.hash, { onDelete: "cascade" }),
    },
    (table) => {
        return {
            indexIdHash: index(
                "IDX_indexIdHash",
            ).on(table.messageId, table.credentialHash),
            primaryKeyIdHash: primaryKey({
                columns: [table.messageId, table.credentialHash],
                name: "PK_primaryKeyIdHash",
            }),
        };
    },
);

export const presentationsToVerifierIdentifiers = pgTable(
    "presentation_to_verifier_identifier",
    {
        presentationHash: varchar("presentationHash")
            .notNull()
            .references(() => presentations.hash, { onDelete: "cascade" }),
        identifierDid: varchar("identifierDid")
            .notNull()
            .references(() => identifiers.did, { onDelete: "cascade" }),
    },
    (table) => {
        return {
            IDX_c3b760612b992bc75511d74f6a: index(
                "IDX_c3b760612b992bc75511d74f6a",
            ).on(table.presentationHash, table.identifierDid),
            PK_c3b760612b992bc75511d74f6a9: primaryKey({
                columns: [table.presentationHash, table.identifierDid],
                name: "PK_c3b760612b992bc75511d74f6a9",
            }),
        };
    },
);

export const presentationsToCredentials = pgTable(
    "presentations_to_credentials",
    {
        presentationHash: varchar("presentationHash")
            .notNull()
            .references(() => presentations.hash, { onDelete: "cascade" }),
        credentialHash: varchar("credentialHash")
            .notNull()
            .references(() => credentials.hash, { onDelete: "cascade" }),
    },
    (table) => {
        return {
            IDX_32d9cee791ee1139f29fd94b5c: index(
                "IDX_32d9cee791ee1139f29fd94b5c",
            ).on(table.presentationHash, table.credentialHash),
            PK_32d9cee791ee1139f29fd94b5c4: primaryKey({
                columns: [table.presentationHash, table.credentialHash],
                name: "PK_32d9cee791ee1139f29fd94b5c4",
            }),
        };
    },
);

export const messagesToPresentations = pgTable(
    "messages_to_presentations",
    {
        messageId: varchar("messageId")
            .notNull()
            .references(() => messages.id, { onDelete: "cascade" }),
        presentationHash: varchar("presentationHash")
            .notNull()
            .references(() => presentations.hash, { onDelete: "cascade" }),
    },
    (table) => {
        return {
            IDX_9dc4cc025ec7163ec5ca919d14: index(
                "IDX_9dc4cc025ec7163ec5ca919d14",
            ).on(table.messageId, table.presentationHash),
            PK_9dc4cc025ec7163ec5ca919d140: primaryKey({
                columns: [table.messageId, table.presentationHash],
                name: "PK_9dc4cc025ec7163ec5ca919d140",
            }),
        };
    },
);



export const identifierRelations = relations(identifiers, ({ one, many }) => ({
    claims_issuerDid: many(claims, {
        relationName: "claim_issuerDid_identifier_did",
    }),
    claims_subjectDid: many(claims, {
        relationName: "claim_subjectDid_identifier_did",
    }),
    presentations: many(presentations),
    messages_fromDid: many(messages, {
        relationName: "message_fromDid_identifier_did",
    }),
    messages_toDid: many(messages, {
        relationName: "message_toDid_identifier_did",
    }),
    credentials_issuerDid: many(credentials, {
        relationName: "credential_issuerDid_identifier_did",
    }),
    credentials_subjectDid: many(credentials, {
        relationName: "credential_subjectDid_identifier_did",
    }),
    presentationsToVerifierIdentifiers: many(presentationsToVerifierIdentifiers),
    keys: many(keys, { relationName: "keys_identifier_did" }),
    services: many(services, {
        relationName: "service_identifier_did",
    }),
}));


export const keyRelations = relations(keys, ({ one, many }) => ({
    identifiers: one(identifiers, {
        fields: [keys.identifierDid],
        references: [identifiers.did],
        relationName: "keys_identifier_did",
    }),
}));


export const serviceRelations = relations(services, ({ one }) => ({
    identifiers: one(identifiers, {
        fields: [services.identifierDid],
        references: [identifiers.did],
        relationName: "service_identifier_did",
    }),
}));

export const credentialRelations = relations(credentials, ({ one, many }) => ({
    credentialsToMessages: many(credentialsToMessages)
}));

export const presentationRelations = relations(presentations, ({ one, many }) => ({
    messagesToPresentations: many(messagesToPresentations),
}));

export const messageRelations = relations(messages, ({ one, many }) => ({
    credentialsToMessages: many(credentialsToMessages),
    messagesToPresentations: many(messagesToPresentations)
}));

export const credentialsToMessagesRelations = relations(credentialsToMessages, ({ one }) => ({
    message: one(messages, {
        fields: [credentialsToMessages.messageId],
        references: [messages.id],
    }),
    credential: one(credentials, {
        fields: [credentialsToMessages.credentialHash],
        references: [credentials.hash],
    }),
}));

export const messagesToPresentationsRelations = relations(messagesToPresentations, ({ one }) => ({
    message: one(messages, {
        fields: [messagesToPresentations.messageId],
        references: [messages.id],
    }),
    presentation: one(presentations, {
        fields: [messagesToPresentations.presentationHash],
        references: [presentations.hash],
    }),
}));