import { IIdentifier, IKey } from "@veramo/core-types";
import { AbstractDIDStore } from "@veramo/did-manager";
import { and, eq } from "drizzle-orm";
import {
	credentials,
	identifiers,
	keys,
	presentations,
	services,
} from "../drizzle/schema";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../drizzle/schema";

// const debug = Debug('veramo:typeorm:identifier-store')

/**
 * An implementation of {@link @veramo/did-manager#AbstractDIDStore | AbstractDIDStore} that uses a TypeORM database to
 * store the relationships between DIDs, their providers and controllers and their keys and services as they are known
 * and managed by a Veramo agent.
 *
 * An instance of this class can be used by {@link @veramo/did-manager#DIDManager} as the data storage layer.
 *
 * To make full use of this class, it should use the same database as the one used by
 * {@link @veramo/data-store#KeyStore | KeyStore}.
 *
 * @public
 */
export class DIDStoreDrizzle extends AbstractDIDStore {
	db: PostgresJsDatabase<typeof schema>

	constructor(db: PostgresJsDatabase<typeof schema>) {
		super();
		this.db = db;
	}
	async getDID({
		did,
		alias,
		provider,
	}: {
		did: string;
		alias: string;
		provider: string;
	}): Promise<IIdentifier> {
		// biome-ignore lint: ok
		let where: any;
		if (did && !alias) {
			// biome-ignore lint: ok
			where = (identifier: any, { eq }: any) => eq(identifier.did, did); // { did };
		} else if (!did && alias) {
			// biome-ignore lint: ok
			where = (identifier: any, { eq }: any) => eq(identifier.alias, alias); // { alias };
		} else {
			throw Error(
				"[veramo:data-store-drizzle:did-store-drizzle] Get requires did or (alias and provider)",
			);
		}

		const id = await this.db.query.identifiers.findFirst({
			where,
			with: { keys: true, services: true },
		});

		if (!id) throw Error("Identifier not found");
		const result: IIdentifier = {
			did: id.did,
			controllerKeyId: id.controllerKeyId || undefined,
			// biome-ignore lint: ok
			provider: id.provider!!,
			// biome-ignore lint: ok
			services: id.services.map((service: any) => {
				let endpoint = service.serviceEndpoint.toString();
				try {
					endpoint = JSON.parse(service.serviceEndpoint);
				} catch { }
				return {
					id: service.id,
					type: service.type,
					serviceEndpoint: endpoint,
					description: service.description,
				};
			}),
			keys: id.keys.map(
				// biome-ignore lint: ok
				(k: any) =>
					({
						kid: k.kid,
						type: k.type,
						kms: k.kms,
						publicKeyHex: k.publicKeyHex,
						meta: k.meta,
					}) as IKey,
			),
		};
		if (id.alias) {
			result.alias = id.alias;
		}
		return result;
	}

	async deleteDID({ did }: { did: string }) {
		const identifier = await this.db.query.identifiers.findFirst({
			// biome-ignore lint: ok
			where: (identifier: any, { eq }: any) => eq(identifier.did, did),
			with: {
				keys: true,
				services: true,
				credentials_issuerDid: true,
				presentations: true,
			},
		});

		if (!identifier || typeof identifier === "undefined") {
			return true;
		}

		// some drivers don't support cascading so we delete these manually
		// try without this
		await this.db.delete(keys).where(eq(keys.identifierDid, did));
		await this.db.delete(credentials).where(eq(credentials.issuerDid, did));
		await this.db.delete(presentations).where(eq(presentations.holderDid, did));
		await this.db.delete(services).where(eq(services.identifierDid, did));

		await this.db.delete(identifiers).where(eq(identifiers.did, did));

		return true;
	}

	async importDID(args: IIdentifier) {

		const id: typeof identifiers.$inferInsert = {
			did: args.did,
			controllerKeyId: args.controllerKeyId,
			provider: args.provider,
			alias: args.alias,
			saveDate: new Date(),
			updateDate: new Date(),
		};

		const idKeys = [];
		for (const argsKey of args.keys) {
			const key1: typeof keys.$inferInsert = {
				kid: argsKey.kid,
				publicKeyHex: argsKey.publicKeyHex,
				kms: argsKey.kms,
				meta: `${argsKey.meta}`,
				type: argsKey.type,
				identifierDid: args.did,
			};
			idKeys.push(key1);
		}

		const idServices = [];
		for (const argsService of args.services) {
			const service1: typeof services.$inferInsert = {
				id: argsService.id,
				type: argsService.type,
				serviceEndpoint:
					typeof argsService.serviceEndpoint === "string"
						? argsService.serviceEndpoint
						: JSON.stringify(argsService.serviceEndpoint),
				description: argsService.description,
				identifierDid: args.did,
			};
			idServices.push(service1);
		}

		await this.db.insert(identifiers).values(id);
		if (idKeys.length > 0) {
			await this.db.insert(keys).values(idKeys);
		}
		if (idServices.length > 0) {
			await this.db.insert(services).values(idServices);
		}

		return true;
	}

	async listDIDs(args: { alias?: string; provider?: string }): Promise<
		IIdentifier[]
	> {
		// biome-ignore lint: ok
		let where = (identifier: any, { eq }: any) =>
			eq(identifier.provider, args.provider);
		if (args.alias) {
			// biome-ignore lint: ok
			where = (identifier: any, { eq }: any) =>
				and(
					eq(identifier.provider, args.provider),
					eq(identifier.alias, args.alias),
				);
		}

		const identifiers = await this.db.query.identifiers.findMany({
			where,
			with: { keys: true, services: true },
		});

		return identifiers.map((identifier) => {
			const i = identifier;
			// if (i.alias === null) {
			// 	// biome-ignore lint: ok
			// 	delete i.alias;
			// }
			return i as IIdentifier;
		});
	}
}
