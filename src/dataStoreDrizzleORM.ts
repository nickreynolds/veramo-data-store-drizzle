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
import { FindArgs, IDataStoreDrizzleORM, UniqueWitnessedVerifiableCredential } from "./types/IDataStoreDrizzleORM";
import { count, eq } from "drizzle-orm";


/**
 * This class implements the {@link @veramo/core-types#IDataStoreORM} query interface using a TypeORM compatible database.
 *
 * This allows you to filter Verifiable Credentials, Presentations and Messages by some common properties that are
 * parsed and stored in database tables.
 *
 * This class is designed to work with {@link @veramo/data-store#DataStore} which is the default way to populate the
 * database with Credentials, Presentations and Messages in such a way that they can be queried by this class.
 * These two classes MUST also share the same database connection.
 *
 * @see {@link @veramo/core-types#IDataStoreORM}
 * @see {@link @veramo/core-types#IDataStore}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */

export type TWitnessedClaimsColumns = TClaimsColumns | "witnessIndex";
export type TWitnessedCredentialColumns = TCredentialColumns | "witnessIndex";


export interface IWitnessDataStoreDrizzleORM {
    dataStoreORMDrizzleGetVerifiableCredentialsByClaimsWitnessed: (
        args: FindArgs,
        context: AuthorizedDIDContext,
    ) => Promise<Array<UniqueVerifiableCredential>>;
}

export class DataStoreDrizzleORM implements IAgentPlugin {
    readonly methods: IDataStoreDrizzleORM //& IWitnessDataStoreDrizzleORM;
    readonly schema = schema.IDataStoreORM;
    db: PostgresJsDatabase<typeof drizzleSchema>;

    constructor(db: PostgresJsDatabase<typeof drizzleSchema>) {
        this.db = db;

        this.methods = {
            dataStoreORMDrizzleGetIdentifiers: this.dataStoreORMDrizzleGetIdentifiers.bind(this),
            dataStoreORMDrizzleGetIdentifiersCount:
                this.dataStoreORMDrizzleGetIdentifiersCount.bind(this),
            // dataStoreORMDrizzleGetMessages: this.dataStoreORMDrizzleGetMessages.bind(this),
            // dataStoreORMDrizzleGetMessagesCount:
            //     this.dataStoreORMDrizzleGetMessagesCount.bind(this),
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
            // dataStoreORMDrizzleGetVerifiablePresentations:
            //     this.dataStoreORMDrizzleGetVerifiablePresentations.bind(this),
            // dataStoreORMDrizzleGetVerifiablePresentationsCount:
            //     this.dataStoreORMDrizzleGetVerifiablePresentationsCount.bind(this),
            // dataStoreORMDrizzleGetVerifiableCredentialsByClaimsWitnessed:
            //     this.dataStoreORMDrizzleGetVerifiableCredentialsByClaimsWitnessed.bind(this),
            // dataStoreORMDrizzleGetWitnessedVerifiableCredentialsByClaimsPaginated:
            //     this.dataStoreORMDrizzleGetWitnessedVerifiableCredentialsByClaimsPaginated.bind(
            //         this,
            //     ),
            // dataStoreORMDrizzleGetWitnessedVerifiableCredentialsPaginated:
            //     this.dataStoreORMDrizzleGetWitnessedVerifiableCredentialsPaginated.bind(this),
        };
    }

    // Identifiers

    // private async identifiersQuery(
    //     args: FindArgs<TIdentifiersColumns>,
    //     context?: AuthorizedDIDContext,
    // ): Promise<SelectQueryBuilder<Identifier>> {
    //     const where = createWhereObject(args);
    //     let qb = (await getConnectedDb(this.dbConnection))
    //         .getRepository(Identifier)
    //         .createQueryBuilder("identifier")
    //         .leftJoinAndSelect("identifier.keys", "keys")
    //         .leftJoinAndSelect("identifier.services", "services")
    //         .where(where);
    //     qb = decorateQB(qb, "message", args);
    //     return qb;
    // }

    async dataStoreORMDrizzleGetIdentifiers(
        args: FindArgs,
        context: AuthorizedDIDContext,
    ): Promise<PartialIdentifier[]> {
        // const identifiers = await (await this.identifiersQuery(args)).getMany();

        const identifiers = await this.db.query.identifiers.findMany({
            where: args.where,
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
        // return await (await this.identifiersQuery(args, context)).getCount();
        const result = await this.db.select({ count: count() }).from(drizzleSchema.identifiers)//.where(eq())
        return result[0].count
    }

    // Messages

    // async dataStoreORMDrizzleGetMessages(
    //     args: FindArgs<TMessageColumns>,
    //     context: AuthorizedDIDContext,
    // ): Promise<IMessage[]> {
    //     const messages = await (await this.messagesQuery(args, context)).getMany();
    //     return messages.map(createMessage);
    // }

    // async dataStoreORMDrizzleGetMessagesCount(
    //     args: FindArgs<TMessageColumns>,
    //     context: AuthorizedDIDContext,
    // ): Promise<number> {
    //     return (await this.messagesQuery(args, context)).getCount();
    // }

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

    // async dataStoreORMDrizzleGetWitnessedVerifiableCredentialsPaginated(
    //     args: {
    //         findArgs: FindArgs<TWitnessedCredentialColumns>;
    //         cursor: string | undefined;
    //     },
    //     context: AuthorizedDIDContext,
    // ): Promise<{
    //     credentials: Array<UniqueWitnessedVerifiableCredential>;
    //     nextCursor: string | null;
    // }> {
    //     const paginator = buildPaginator({
    //         entity: Credential,
    //         paginationKeys: ["witnessIndex"],
    //         query: {
    //             limit: 2,
    //             order: "DESC",
    //             afterCursor: args.cursor,
    //         },
    //     });
    //     const paginationResult = await paginator.paginate(
    //         await this.credentialsQuery(args.findArgs, context),
    //     );
    //     const credentials = paginationResult.data.map((vc) => ({
    //         hash: vc.hash,
    //         verifiableCredential: vc.raw,
    //         witnessIndex: vc.witnessIndex,
    //     }));
    //     return {
    //         credentials,
    //         nextCursor: paginationResult.cursor.afterCursor,
    //     };
    // }

    // async dataStoreORMDrizzleGetWitnessedVerifiableCredentialsByClaimsPaginated(
    //     args: {
    //         findArgs: FindArgs<TWitnessedClaimsColumns>;
    //         cursor: string | undefined;
    //     },
    //     context?: AuthorizedDIDContext,
    // ): Promise<{
    //     credentials: Array<UniqueWitnessedVerifiableCredential>;
    //     nextCursor: string | null;
    // }> {
    //     const paginator = buildPaginator({
    //         entity: Claim,
    //         paginationKeys: ["witnessIndex"],
    //         query: {
    //             limit: 2,
    //             order: "DESC",
    //             afterCursor: args.cursor,
    //         },
    //     });
    //     const paginationResult = await paginator.paginate(
    //         await this.claimsQuery(args.findArgs, context),
    //     );
    //     const credentials = paginationResult.data
    //         .map((claim) => ({
    //             hash: claim.credential.hash,
    //             verifiableCredential: claim.credential.raw,
    //             witnessIndex: claim.witnessIndex,
    //         }))
    //         .reduce(
    //             (
    //                 acc: UniqueWitnessedVerifiableCredential[],
    //                 current: UniqueWitnessedVerifiableCredential,
    //             ) => {
    //                 if (!acc.some((item) => item.hash === current.hash)) {
    //                     acc.push(current);
    //                 }
    //                 return acc;
    //             },
    //             [],
    //         );
    //     return {
    //         credentials,
    //         nextCursor: paginationResult.cursor.afterCursor,
    //     };
    // }

    async dataStoreORMDrizzleGetVerifiableCredentialsByClaimsCount(
        args: FindArgs,
        context: AuthorizedDIDContext,
    ): Promise<number> {
        // return (await this.claimsQuery(args, context)).getCount();

        throw new Error("Method not implemented.");
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
        // return (await this.credentialsQuery(args, context)).getCount();


        throw new Error("Method not implemented.");
    }

    //     // Presentations

    //     private async presentationsQuery(
    //         args: FindArgs<TPresentationColumns>,
    //         context: AuthorizedDIDContext,
    //     ): Promise<SelectQueryBuilder<Presentation>> {
    //         const where = createWhereObject(args);
    //         let qb = (await getConnectedDb(this.dbConnection))
    //             .getRepository(Presentation)
    //             .createQueryBuilder("presentation")
    //             .leftJoinAndSelect("presentation.holder", "holder")
    //             .leftJoinAndSelect("presentation.verifier", "verifier")
    //             .where(where);
    //         qb = decorateQB(qb, "presentation", args);
    //         qb = addVerifierQuery(args, qb);
    //         if (context.authorizedDID) {
    //             qb = qb.andWhere(
    //                 new Brackets((qb) => {
    //                     qb.where("verifier.did = :ident", {
    //                         ident: context.authorizedDID,
    //                     }).orWhere("presentation.holder = :ident", {
    //                         ident: context.authorizedDID,
    //                     });
    //                 }),
    //             );
    //         }
    //         return qb;
    //     }

    //     async dataStoreORMDrizzleGetVerifiablePresentations(
    //         args: FindArgs<TPresentationColumns>,
    //         context: AuthorizedDIDContext,
    //     ): Promise<Array<UniqueVerifiablePresentation>> {
    //         const presentations = await (
    //             await this.presentationsQuery(args, context)
    //         ).getMany();
    //         return presentations.map((vp) => ({
    //             hash: vp.hash,
    //             verifiablePresentation: vp.raw,
    //         }));
    //     }

    //     async dataStoreORMDrizzleGetVerifiablePresentationsCount(
    //         args: FindArgs<TPresentationColumns>,
    //         context: AuthorizedDIDContext,
    //     ): Promise<number> {
    //         return (await this.presentationsQuery(args, context)).getCount();
    //     }
    // }

    // // biome-ignore lint: ok
    // function opToSQL(item: Where<any>): any[] {
    //     switch (item.op) {
    //         case "IsNull":
    //             return ["IS NULL", ""];
    //         case "Like":
    //             // biome-ignore lint: ok
    //             if (item.value?.length != 1)
    //                 throw Error("Operation Equal requires one value");
    //             return ["LIKE :value", item.value[0]];
    //         case "Equal":
    //             // biome-ignore lint: ok
    //             if (item.value?.length != 1)
    //                 throw Error("Operation Equal requires one value");
    //             return ["= :value", item.value[0]];
    //         case "Any":
    //         case "Between":
    //         case "LessThan":
    //         case "LessThanOrEqual":
    //         case "MoreThan":
    //         case "MoreThanOrEqual":
    //             throw new Error(`${item.op} not compatible with DID argument`);
    //         // biome-ignore lint: ok
    //         case "In":
    //         default:
    //             return ["IN (:...value)", item.value];
    //     }
    // }

    // function addVerifierQuery(
    //     // biome-ignore lint: ok
    //     input: FindArgs<any>,
    //     // biome-ignore lint: ok
    //     qb: SelectQueryBuilder<any>,
    //     // biome-ignore lint: ok
    // ): SelectQueryBuilder<any> {
    //     if (!input) {
    //         return qb;
    //     }
    //     if (!Array.isArray(input.where)) {
    //         return qb;
    //     }
    //     const verifierWhere = input.where.find((item) => item.column === "verifier");
    //     if (!verifierWhere) {
    //         return qb;
    //     }
    //     const [op, value] = opToSQL(verifierWhere);
    //     return qb.andWhere(`verifier.did ${op}`, { value });
    // }

    // function createWhereObject(
    //     input: FindArgs<
    //         | TMessageColumns
    //         | TClaimsColumns
    //         | TCredentialColumns
    //         | TPresentationColumns
    //         | TIdentifiersColumns
    //         | "witnessIndex"
    //     >,
    //     // biome-ignore lint: ok
    // ): any {
    //     // biome-ignore lint: ok
    //     const where: Record<string, any> = {};
    //     if (input?.where) {
    //         for (const item of input.where) {
    //             if (item.column === "verifier") {
    //                 continue;
    //             }
    //             switch (item.op) {
    //                 case "Any":
    //                     if (!Array.isArray(item.value))
    //                         throw Error("Operator Any requires value to be an array");
    //                     where[item.column] = Any(item.value);
    //                     break;
    //                 case "Between":
    //                     // biome-ignore lint: ok
    //                     if (item.value?.length != 2)
    //                         throw Error("Operation Between requires two values");
    //                     where[item.column] = Between(item.value[0], item.value[1]);
    //                     break;
    //                 case "Equal":
    //                     // biome-ignore lint: ok
    //                     if (item.value?.length != 1)
    //                         throw Error("Operation Equal requires one value");
    //                     where[item.column] = Equal(item.value[0]);
    //                     break;
    //                 case "IsNull":
    //                     where[item.column] = IsNull();
    //                     break;
    //                 case "LessThan":
    //                     // biome-ignore lint: ok
    //                     if (item.value?.length != 1)
    //                         throw Error("Operation LessThan requires one value");
    //                     where[item.column] = LessThan(item.value[0]);
    //                     break;
    //                 case "LessThanOrEqual":
    //                     // biome-ignore lint: ok
    //                     if (item.value?.length != 1)
    //                         throw Error("Operation LessThanOrEqual requires one value");
    //                     where[item.column] = LessThanOrEqual(item.value[0]);
    //                     break;
    //                 case "Like":
    //                     // biome-ignore lint: ok
    //                     if (item.value?.length != 1)
    //                         throw Error("Operation Like requires one value");
    //                     where[item.column] = Like(item.value[0]);
    //                     break;
    //                 case "MoreThan":
    //                     // biome-ignore lint: ok
    //                     if (item.value?.length != 1)
    //                         throw Error("Operation MoreThan requires one value");
    //                     where[item.column] = MoreThan(item.value[0]);
    //                     break;
    //                 case "MoreThanOrEqual":
    //                     // biome-ignore lint: ok
    //                     if (item.value?.length != 1)
    //                         throw Error("Operation MoreThanOrEqual requires one value");
    //                     where[item.column] = MoreThanOrEqual(item.value[0]);
    //                     break;
    //                 // biome-ignore lint: ok
    //                 case "In":
    //                 default:
    //                     if (!Array.isArray(item.value))
    //                         throw Error("Operator IN requires value to be an array");
    //                     where[item.column] = In(item.value);
    //             }
    //             if (item.not === true) {
    //                 where[item.column] = Not(where[item.column]);
    //             }
    //         }
    //     }
    //     return where;
    // }

    // function decorateQB(
    //     // biome-ignore lint: ok
    //     qb: SelectQueryBuilder<any>,
    //     tableName: string,
    //     // biome-ignore lint: ok
    //     input: FindArgs<any>,
    //     // biome-ignore lint: ok
    // ): SelectQueryBuilder<any> {
    //     // biome-ignore lint: ok
    //     if (input?.skip) qb = qb.offset(input.skip);
    //     // biome-ignore lint: ok
    //     if (input?.take) qb = qb.limit(input.take);

    //     if (input?.order) {
    //         for (const item of input.order) {
    //             // biome-ignore lint: ok
    //             qb = qb.addSelect(
    //                 // biome-ignore lint: ok
    //                 qb.connection.driver.escape(tableName) +
    //                 "." +
    //                 qb.connection.driver.escape(item.column),
    //                 item.column,
    //             );
    //             // biome-ignore lint: ok
    //             qb = qb.orderBy(qb.connection.driver.escape(item.column), item.direction);
    //         }
    //     }
    //     return qb;
}
