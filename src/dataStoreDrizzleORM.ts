import {
    AuthorizedDIDContext,
    // FindArgs,
    IAgentPlugin,
    IDataStoreORM,
    IIdentifier,
    IMessage,
    PartialIdentifier,
    TClaimsColumns,
    TCredentialColumns,
    TIdentifiersColumns,
    TMessageColumns,
    TPresentationColumns,
    UniqueVerifiableCredential,
    UniqueVerifiablePresentation,
    Where,
} from "@veramo/core-types";
import { schema } from "@veramo/core-types";
import { OrPromise } from "@veramo/utils";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as drizzleSchema from "./drizzle/schema";
import { credentials, credentialsToMessages, messages, messagesToPresentations, presentations } from "./drizzle/schema";
import { FindArgs, IDataStoreDrizzleORM, UniqueWitnessedVerifiableCredential } from "./types/IDataStoreDrizzleORM";
import { count, eq, SQL } from "drizzle-orm";
import { createMessage } from "./drizzle/helpers";


/**
 * This class implements the {@link @witnessco/veramo-data-store#IDataStoreDrizzleORM} query interface using a DrizzleORM compatible database.
 *
 * This allows you to filter Verifiable Credentials, Presentations and Messages by some common properties that are
 * parsed and stored in database tables.
 *
 * This class is designed to work with {@link @witnessco/veramo-data-store#IDataStoreDrizzle} which is the default way to populate the
 * database with Credentials, Presentations and Messages in such a way that they can be queried by this class.
 * These two classes MUST also share the same database connection.
 *
 * @see {@link @witnessco/veramo-data-store#IDataStoreDrizzleORM}
 * @see {@link @witnessco/veramo-data-store#IDataStoreDrizzle}
 * */

export class DataStoreDrizzleORM implements IAgentPlugin {
    readonly methods: IDataStoreDrizzleORM
    readonly schema = schema.IDataStoreORM;
    db: PostgresJsDatabase<typeof drizzleSchema>;

    constructor(db: PostgresJsDatabase<typeof drizzleSchema>) {
        this.db = db;

        this.methods = {
            dataStoreORMDrizzleGetIdentifiers: this.dataStoreORMDrizzleGetIdentifiers.bind(this),
            dataStoreORMDrizzleGetIdentifiersCount:
                this.dataStoreORMDrizzleGetIdentifiersCount.bind(this),
            dataStoreORMDrizzleGetMessages: this.dataStoreORMDrizzleGetMessages.bind(this),
            dataStoreORMDrizzleGetMessagesCount:
                this.dataStoreORMDrizzleGetMessagesCount.bind(this),
            dataStoreORMDrizzleGetVerifiableCredentialsByClaims:
                this.dataStoreORMDrizzleGetVerifiableCredentialsByClaims.bind(this),
            dataStoreORMDrizzleGetWitnessedVerifiableCredentialsByClaims:
                this.dataStoreORMDrizzleGetWitnessedVerifiableCredentialsByClaims.bind(this),
            dataStoreORMDrizzleGetVerifiableCredentialsByClaimsCount:
                this.dataStoreORMDrizzleGetVerifiableCredentialsByClaimsCount.bind(this),
            dataStoreORMDrizzleGetVerifiableCredentials:
                this.dataStoreORMDrizzleGetVerifiableCredentials.bind(this),
            dataStoreORMDrizzleGetVerifiableCredentialsCount:
                this.dataStoreORMDrizzleGetVerifiableCredentialsCount.bind(this),
            dataStoreORMDrizzleGetVerifiablePresentations:
                this.dataStoreORMDrizzleGetVerifiablePresentations.bind(this),
            dataStoreORMDrizzleGetVerifiablePresentationsCount:
                this.dataStoreORMDrizzleGetVerifiablePresentationsCount.bind(this),
        };
    }

    // Identifiers

    async dataStoreORMDrizzleGetIdentifiers(
        args: FindArgs,
        context: AuthorizedDIDContext,
    ): Promise<PartialIdentifier[]> {
        // const identifiers = await (await this.identifiersQuery(args)).getMany();

        const identifiers = await this.db.query.identifiers.findMany({
            where: args.where,
            orderBy: args.orderBy,
            limit: args.limit,
            with: {
                keys: true,
                services: true
            }
        })

        return identifiers.map((i) => {
            const identifier: PartialIdentifier = i as PartialIdentifier;
            if (identifier.controllerKeyId === null) {
                // biome-ignore lint: ok
                delete identifier.controllerKeyId;
            }
            if (identifier.alias === null) {
                // biome-ignore lint: ok
                delete identifier.alias;
            }
            if (identifier.provider === null) {
                // biome-ignore lint: ok
                delete identifier.provider;
            }
            return identifier as IIdentifier;
        });
    }

    async dataStoreORMDrizzleGetIdentifiersCount(
        args: FindArgs,
        context: AuthorizedDIDContext,
    ): Promise<number> {
        // const result = await this.db.select({ count: count() }).from(drizzleSchema.identifiers).where(args.where)
        const results = await this.db.query.identifiers.findMany({ where: args.where })
        return results.length
    }

    // Messages

    async dataStoreORMDrizzleGetMessages(
        args: FindArgs,
        context: AuthorizedDIDContext,
    ): Promise<IMessage[]> {
        const result = await this.db.query.messages.findMany({
            with: {
                credentialsToMessages: {
                    with: {
                        credential: true
                    }
                },
                messagesToPresentations: {
                    with: {
                        presentation: true
                    }
                }
            },
            where: args.where,
        })

        const messages = result.map((m) => {
            const messageCredentials = m.credentialsToMessages.map((ctm) => ctm.credential)
            const messagePresentations = m.messagesToPresentations.map((mtp) => mtp.presentation)
            return createMessage(m, messageCredentials, messagePresentations)
        })

        console.log("messages: ", messages)
        return messages
    }

    async dataStoreORMDrizzleGetMessagesCount(
        args: FindArgs,
        context: AuthorizedDIDContext,
    ): Promise<number> {
        // return (await this.messagesQuery(args, context)).getCount();
        throw new Error("Method not implemented.");
    }

    async dataStoreORMDrizzleGetVerifiableCredentialsByClaims(
        args: FindArgs,
        context: AuthorizedDIDContext,
    ): Promise<Array<UniqueVerifiableCredential>> {

        // const where = createWhereObject(args);
        const claims = await this.db.query.claims.findMany({
            where: args.where,
            orderBy: args.orderBy,
            with: {
                credential: true
            }
        })

        return claims.map((c) => {
            return {
                hash: c.credential.hash,
                verifiableCredential: JSON.parse(c.credential.raw)
            }
        })
            .reduce(
                (
                    acc: UniqueVerifiableCredential[],
                    current: UniqueVerifiableCredential,
                ) => {
                    if (!acc.some((item) => item.hash === current.hash)) {
                        acc.push(current);
                    }
                    return acc;
                },
                [],
            );
    }

    async dataStoreORMDrizzleGetWitnessedVerifiableCredentialsByClaims(
        args: FindArgs,
        context: AuthorizedDIDContext,
    ): Promise<Array<UniqueWitnessedVerifiableCredential>> {
        const claims = await this.db.query.claims.findMany({
            where: args.where,
            orderBy: args.orderBy,
            with: {
                credential: true
            },
            limit: args.limit,
        })
        return claims.map((c) => {
            return {
                hash: c.credential.hash,
                verifiableCredential: JSON.parse(c.credential.raw),
                witnessIndex: c.credential.witnessIndex
            }
        })
            .reduce(
                (
                    acc: UniqueVerifiableCredential[],
                    current: UniqueVerifiableCredential,
                ) => {
                    if (!acc.some((item) => item.hash === current.hash)) {
                        acc.push(current);
                    }
                    return acc;
                },
                [],
            );
    }

    async dataStoreORMDrizzleGetVerifiableCredentialsByClaimsCount(
        args: FindArgs,
        context: AuthorizedDIDContext,
    ): Promise<number> {
        const claims = await this.db.query.claims.findMany({
            where: args.where,
            with: {
                credential: true
            },
            limit: args.limit,
        })
        return claims.map((c) => {
            return {
                hash: c.credential.hash,
                verifiableCredential: JSON.parse(c.credential.raw),
                witnessIndex: c.credential.witnessIndex
            }
        })
            .reduce(
                (
                    acc: UniqueVerifiableCredential[],
                    current: UniqueVerifiableCredential,
                ) => {
                    if (!acc.some((item) => item.hash === current.hash)) {
                        acc.push(current);
                    }
                    return acc;
                },
                [],
            ).length;
    }

    // Credentials

    async dataStoreORMDrizzleGetVerifiableCredentials(
        args: FindArgs,
        context: AuthorizedDIDContext,
    ): Promise<Array<UniqueVerifiableCredential>> {
        const credentials =
            await this.db.query.credentials.findMany({
                limit: args.limit,
                where: args.where,
                orderBy: args.orderBy
            })
        return credentials.map((vc) => ({
            hash: vc.hash,
            verifiableCredential: JSON.parse(vc.raw),
        }));
    }

    async dataStoreORMDrizzleGetVerifiableCredentialsCount(
        args: FindArgs,
        context: AuthorizedDIDContext,
    ): Promise<number> {
        const credentials =
            await this.db.query.credentials.findMany({
                limit: args.limit,
                where: args.where,
                orderBy: args.orderBy
            })
        return credentials.length
    }

    //     // Presentations

    async dataStoreORMDrizzleGetVerifiablePresentations(
        args: FindArgs,
        context: AuthorizedDIDContext,
    ): Promise<Array<UniqueVerifiablePresentation>> {
        const presentations =
            await this.db.query.presentations.findMany({
                limit: args.limit,
                where: args.where,
                orderBy: args.orderBy
            })
        return presentations.map((vp) => ({
            hash: vp.hash,
            verifiablePresentation: JSON.parse(vp.raw),
        }));
    }

    async dataStoreORMDrizzleGetVerifiablePresentationsCount(
        args: FindArgs,
        context: AuthorizedDIDContext,
    ): Promise<number> {
        const presentations =
            await this.db.query.presentations.findMany({
                limit: args.limit,
                where: args.where,
                orderBy: args.orderBy
            })
        return presentations.map((vp) => ({
            hash: vp.hash,
            verifiablePresentation: JSON.parse(vp.raw),
        })).length;
    }
}