import { VerifiableCredential, VerifiablePresentation } from '@veramo/core-types'
import { IIdentifier } from '@veramo/core-types'
import { IAgentContext, IPluginMethodMap } from '@veramo/core-types'
import { IMessage } from '@veramo/core-types'
import { BinaryOperator, SQL } from 'drizzle-orm'
import { PgTableWithColumns } from 'drizzle-orm/pg-core'


/**
 * Represents an {@link IDataStoreDrizzleORM} Query.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface FindArgs {
    /**
     * Imposes constraints on the values of the given columns.
     * WHERE clauses are combined using AND.
     */
    where?: SQL | SQL<unknown> | BinaryOperator

    /**
     * Sorts the results according to the given array of column priorities.
     */
    orderBy?: SQL

    /**
     * Ignores the first number of entries in a {@link IDataStoreDrizzleORM} query result.
     */
    skip?: number

    /**
     * Returns at most this number of results from a {@link IDataStoreDrizzleORM} query.
     */
    limit?: number
}


/**
 * This context can be used for Veramo Agents that are created behind an authorization mechanism, that attaches a DID
 * as the authorized executor of certain actions. This authorized DID is used to further filter the data that is
 * available for querying.
 *
 * This does not constitute an authorization mechanism, but relies on an authorization mechanism existing before the
 * Veramo Agent is created.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface AuthorizedDIDContext extends IAgentContext<{}> {
    authorizedDID?: string
}

/**
 * Represents the result of a Query for {@link VerifiableCredential}s
 *
 * See {@link IDataStoreDrizzleORM.dataStoreORMDrizzleGetVerifiableCredentials}
 * See {@link IDataStoreDrizzleORM.dataStoreORMDrizzleGetVerifiableCredentialsByClaims}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface UniqueVerifiableCredential {
    hash: string
    verifiableCredential: VerifiableCredential
}

/**
 * Represents the result of a Query for a witnessed {@link VerifiableCredential}s
 *
 * See {@link IDataStoreDrizzleORM.dataStoreORMDrizzleGetWitnessedVerifiableCredentials}
 * See {@link IDataStoreDrizzleORM.dataStoreORMDrizzleGetVerifiableCredentialsByClaims}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface UniqueWitnessedVerifiableCredential
    extends UniqueVerifiableCredential {
    witnessIndex?: string;
}


/**
 * Represents the result of a Query for {@link VerifiablePresentation}s
 *
 * See {@link IDataStoreDrizzleORM.dataStoreORMDrizzleGetVerifiablePresentations}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface UniqueVerifiablePresentation {
    hash: string
    verifiablePresentation: VerifiablePresentation
}

/**
 * The filter that can be used to find {@link IIdentifier}s in the data store.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type FindIdentifiersArgs = FindArgs

/**
 * The filter that can be used to find {@link IMessage}s in the data store.
 * See {@link IDataStoreORM.dataStoreORMDrizzleGetMessages}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type FindMessagesArgs = FindArgs

/**
 * The filter that can be used to find {@link VerifiableCredential}s in the data store, based on the types and values
 * of their claims.
 *
 * See {@link IDataStoreORM.dataStoreORMDrizzleGetVerifiableCredentialsByClaims}
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type FindClaimsArgs = FindArgs

/**
 * The filter that can be used to find {@link VerifiableCredential}s in the data store.
 * See {@link IDataStoreORM.dataStoreORMDrizzleGetVerifiableCredentials}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type FindCredentialsArgs = FindArgs

/**
 * The filter that can be used to find {@link VerifiablePresentation}s in the data store.
 * See {@link IDataStoreORM.dataStoreORMDrizzleGetVerifiablePresentations}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type FindPresentationsArgs = FindArgs

/**
 * The result of a {@link IDataStoreORM.dataStoreORMDrizzleGetIdentifiers} query.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type PartialIdentifier = Partial<IIdentifier>

/**
 * This is the default query interface for the credential data stored by a Veramo agent.
 *
 * Plugins implementing this interface are expected to implement this simple query functionality to filter the data
 * that was saved using {@link IDataStore}.
 *
 * If this interface is implemented by a different plugin than {@link IDataStore}, then both plugins MUST use the same
 * media for data storage.
 *
 * @see {@link @veramo/data-store#DataStoreORM} for an implementation using a TypeORM backend
 * @see {@link @veramo/data-store-json#DataStoreJson} for an implementation using a JSON object that can also be
 *   persisted.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IDataStoreDrizzleORM extends IPluginMethodMap {
    /**
     * Tries to obtain a list of {@link IIdentifier | IIdentifiers} that match the given filter.
     * The origin of these identifiers is from any credential / presentation or message that was successfully processed
     * by this agent.
     *
     * If the same database is used for implementations of {@link @veramo/did-manager#AbstractDIDStore |
     * AbstractDIDStore}, then these identifiers can also come from {@link IDIDManager.didManagerCreate |
     * didManagerCreate} or {@link IDIDManager.didManagerImport | didManagerImport} operations.
     *
     * @param args - The filter to apply when querying
     * @param context - Can be used to signal that only a particular DID is authorized to perform this operation. This
     *   will cause the result to only contain data that this DID should be able to access.
     *
     * @deprecated This will be removed in future versions of this plugin interface.
     * @beta This API may change without a BREAKING CHANGE notice.
     */
    dataStoreORMDrizzleGetIdentifiers(
        args: FindIdentifiersArgs,
        context: AuthorizedDIDContext,
    ): Promise<Array<PartialIdentifier>>

    /**
     * Tries to obtain a count of {@link IIdentifier | IIdentifiers} that match the given filter.
     * The origin of these identifiers is from any credential / presentation or message that was successfully processed
     * by this agent.
     *
     * If the same database is used for implementations of {@link @veramo/did-manager#AbstractDIDStore |
     * AbstractDIDStore}, then these identifiers can also come from {@link IDIDManager.didManagerCreate |
     * didManagerCreate} or {@link IDIDManager.didManagerImport | didManagerImport} operations.
     *
     * @param args - The filter to apply when querying
     * @param context - Can be used to signal that only a particular DID is authorized to perform this operation. This
     *   will cause the result to only contain data that this DID should be able to access.
     *
     * @deprecated This will be removed in future versions of this plugin interface.
     * @beta This API may change without a BREAKING CHANGE notice.
     */
    dataStoreORMDrizzleGetIdentifiersCount(args: FindIdentifiersArgs, context: AuthorizedDIDContext): Promise<number>

    // /**
    //  * Returns a list of {@link IMessage}s that match the given filter.
    //  * These are messages that were stored using {@link IDataStore.dataStoreSaveMessage | dataStoreSaveMessage}.
    //  *
    //  * @param args - The filter to apply when querying
    //  * @param context - Can be used to signal that only a particular DID is authorized to perform this operation. This
    //  *   will cause the result to only contain data that this DID should be able to access.
    //  *
    //  * @beta This API may change without a BREAKING CHANGE notice.
    //  */
    // dataStoreORMDrizzleGetMessages(args: FindMessagesArgs, context: AuthorizedDIDContext): Promise<Array<IMessage>>

    // /**
    //  * Returns a count of {@link IMessage}s that match the given filter.
    //  * These are messages that were stored using {@link IDataStore.dataStoreSaveMessage | dataStoreSaveMessage}.
    //  *
    //  * @param args - The filter to apply when querying.
    //  * @param context - Can be used to signal that only a particular DID is authorized to perform this operation. This
    //  *   will cause the result to only contain data that this DID should be able to access.
    //  *
    //  * @beta This API may change without a BREAKING CHANGE notice.
    //  */
    // dataStoreORMDrizzleGetMessagesCount(args: FindMessagesArgs, context: AuthorizedDIDContext): Promise<number>

    /**
     * Returns a list of {@link UniqueVerifiableCredential}s that match the given filter based on the claims they
     * contain.
     *
     * These are VerifiableCredentials that were stored using
     * {@link IDataStore.dataStoreSaveVerifiableCredential | dataStoreSaveVerifiableCredential}.
     *
     * @param args - The filter to apply when querying
     * @param context - Can be used to signal that only a particular DID is authorized to perform this operation. This
     *   will cause the result to only contain data that this DID should be able to access.
     *
     * @beta This API may change without a BREAKING CHANGE notice.
     */
    dataStoreORMDrizzleGetVerifiableCredentialsByClaims(
        args: FindClaimsArgs,
        context: AuthorizedDIDContext,
    ): Promise<Array<UniqueVerifiableCredential>>

    /**
     * Returns a count of {@link UniqueVerifiableCredential}s that match the given filter based on the claims they
     * contain.
     *
     * These are VerifiableCredentials that were stored using
     * {@link IDataStore.dataStoreSaveVerifiableCredential | dataStoreSaveVerifiableCredential}.
     *
     * @param args - The filter to apply when querying
     * @param context - Can be used to signal that only a particular DID is authorized to perform this operation. This
     *   will cause the result to only contain data that this DID should be able to access.
     *
     * @beta This API may change without a BREAKING CHANGE notice.
     */
    dataStoreORMDrizzleGetVerifiableCredentialsByClaimsCount(
        args: FindClaimsArgs,
        context: AuthorizedDIDContext,
    ): Promise<number>

    /**
 * Returns a list of {@link UniqueVerifiableCredential}s that match the given filter based on the claims they
 * contain.
 *
 * These are VerifiableCredentials that were stored using
 * {@link IDataStore.dataStoreSaveVerifiableCredential | dataStoreSaveVerifiableCredential}.
 *
 * @param args - The filter to apply when querying
 * @param context - Can be used to signal that only a particular DID is authorized to perform this operation. This
 *   will cause the result to only contain data that this DID should be able to access.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
    dataStoreORMDrizzleGetWitnessedVerifiableCredentialsByClaims(
        args: FindClaimsArgs,
        context: AuthorizedDIDContext,
    ): Promise<Array<UniqueVerifiableCredential>>

    /**
     * Returns a count of {@link UniqueVerifiableCredential}s that match the given filter based on the claims they
     * contain.
     *
     * These are VerifiableCredentials that were stored using
     * {@link IDataStore.dataStoreSaveVerifiableCredential | dataStoreSaveVerifiableCredential}.
     *
     * @param args - The filter to apply when querying
     * @param context - Can be used to signal that only a particular DID is authorized to perform this operation. This
     *   will cause the result to only contain data that this DID should be able to access.
     *
     * @beta This API may change without a BREAKING CHANGE notice.
     */
    dataStoreORMDrizzleGetVerifiableCredentialsByClaimsCount(
        args: FindClaimsArgs,
        context: AuthorizedDIDContext,
    ): Promise<number>

    /**
     * Returns a list of {@link UniqueVerifiableCredential}s that match the given filter based on the top level
     * properties of a credential.
     *
     * These are VerifiableCredentials that were stored using
     * {@link IDataStore.dataStoreSaveVerifiableCredential | dataStoreSaveVerifiableCredential}.
     *
     * @param args - The filter to apply when querying
     * @param context - Can be used to signal that only a particular DID is authorized to perform this operation. This
     *   will cause the result to only contain data that this DID should be able to access.
     *
     * @beta This API may change without a BREAKING CHANGE notice.
     */
    dataStoreORMDrizzleGetVerifiableCredentials(
        args: FindCredentialsArgs,
        context: AuthorizedDIDContext,
    ): Promise<Array<UniqueVerifiableCredential>>

    /**
     * Returns a count of {@link UniqueVerifiableCredential}s that match the given filter based on the top level
     * properties of a credential.
     *
     * These are VerifiableCredentials that were stored using
     * {@link IDataStore.dataStoreSaveVerifiableCredential | dataStoreSaveVerifiableCredential}.
     *
     * @param args - The filter to apply when querying
     * @param context - Can be used to signal that only a particular DID is authorized to perform this operation. This
     *   will cause the result to only contain data that this DID should be able to access.
     *
     * @beta This API may change without a BREAKING CHANGE notice.
     */
    dataStoreORMDrizzleGetVerifiableCredentialsCount(
        args: FindCredentialsArgs,
        context: AuthorizedDIDContext,
    ): Promise<number>

    // /**
    //  * Returns a list of {@link UniqueVerifiablePresentation}s that match the given filter based on the top level
    //  * properties of a presentation.
    //  *
    //  * These are {@link VerifiablePresentation}s that were stored using
    //  * {@link IDataStore.dataStoreSaveVerifiablePresentation | dataStoreSaveVerifiablePresentation}.
    //  *
    //  * @param args - The filter to apply when querying
    //  * @param context - Can be used to signal that only a particular DID is authorized to perform this operation. This
    //  *   will cause the result to only contain data that this DID should be able to access.
    //  *
    //  * @beta This API may change without a BREAKING CHANGE notice.
    //  */
    // dataStoreORMDrizzleGetVerifiablePresentations(
    //     args: FindPresentationsArgs,
    //     context: AuthorizedDIDContext,
    // ): Promise<Array<UniqueVerifiablePresentation>>

    // /**
    //  * Returns a count of {@link UniqueVerifiablePresentation}s that match the given filter based on the top level
    //  * properties of a presentation.
    //  *
    //  * These are {@link VerifiablePresentation}s that were stored using
    //  * {@link IDataStore.dataStoreSaveVerifiablePresentation | dataStoreSaveVerifiablePresentation}.
    //  *
    //  * @param args - The filter to apply when querying
    //  * @param context - Can be used to signal that only a particular DID is authorized to perform this operation. This
    //  *   will cause the result to only contain data that this DID should be able to access.
    //  *
    //  * @beta This API may change without a BREAKING CHANGE notice.
    //  */
    // dataStoreORMDrizzleGetVerifiablePresentationsCount(
    //     args: FindPresentationsArgs,
    //     context: AuthorizedDIDContext,
    // ): Promise<number>
}
