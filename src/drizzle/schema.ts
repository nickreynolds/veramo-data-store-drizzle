import { relations, sql } from "drizzle-orm";
import {
    index,
    pgTable,
    primaryKey,
    text,
    varchar,
} from "drizzle-orm/pg-core";


export const messages = pgTable("messages", {
    id: varchar("id").primaryKey().notNull(),
    raw: varchar("raw"),
});

export const credentials = pgTable("credentials", {
    hash: text("hash").primaryKey().notNull(),
    raw: text("raw").notNull(),
    id: varchar("id"),
});

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


export const credentialRelations = relations(credentials, ({ one, many }) => ({
    credentialsToMessages: many(credentialsToMessages)
}));

export const messageRelations = relations(messages, ({ one, many }) => ({
    credentialsToMessages: many(credentialsToMessages),
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