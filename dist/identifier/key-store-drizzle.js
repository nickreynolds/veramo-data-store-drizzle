"use strict";
// import { IKey, ManagedKeyInfo } from "@veramo/core-types";
// import { AbstractKeyStore } from "@veramo/key-manager";
// import { eq } from "drizzle-orm";
// import { db } from "../drizzle/db";
// import { key } from "../drizzle/schema";
// // const debug = Debug("veramo:typeorm:key-store");
// /**
//  * An implementation of {@link @veramo/key-manager#AbstractKeyStore | AbstractKeyStore} that uses a TypeORM database to
//  * store the relationships between keys, their IDs, aliases and
//  * {@link @veramo/key-manager#AbstractKeyManagementSystem | KMS implementations}, as they are known and managed by a
//  * Veramo agent.
//  *
//  * An instance of this class can be used by {@link @veramo/key-manager#KeyManager} as the data storage layer.
//  *
//  * To make full use of this class, it should use the same database as the one used by
//  * {@link @veramo/data-store#DIDStore | DIDStore}.
//  *
//  * @public
//  */
// export class KeyStoreDrizzle extends AbstractKeyStore {
// 	async getKey({ kid }: { kid: string }): Promise<IKey> {
// 		const key1 = await db.query.key.findFirst({
// 			// biome-ignore lint: ok
// 			where: (key: any, { eq }: any) => eq(key.kid, kid),
// 		});
// 		if (!key1) throw Error("Key not found");
// 		return key1 as IKey;
// 	}
// 	async deleteKey({ kid }: { kid: string }) {
// 		const key1 = await db.query.key.findFirst({
// 			// biome-ignore lint: ok
// 			where: (key: any, { eq }: any) => eq(key.kid, kid),
// 		});
// 		if (!key1) throw Error("Key not found");
// 		console.log("Deleting key", kid);
// 		await db.delete(key).where(eq(key.kid, kid));
// 		return true;
// 	}
// 	async importKey(args: IKey) {
// 		const key1: typeof key.$inferInsert = {
// 			kid: args.kid,
// 			publicKeyHex: args.publicKeyHex,
// 			type: args.type,
// 			kms: args.kms,
// 			meta: `${args.meta}` || undefined,
// 		};
// 		console.log("Saving key", args.kid);
// 		await db.insert(key).values(key1);
// 		return true;
// 	}
// 	// biome-ignore lint: ok
// 	async listKeys(args: {} = {}): Promise<ManagedKeyInfo[]> {
// 		const keys = await db.query.key.findMany();
// 		const managedKeys: ManagedKeyInfo[] = keys.map((key) => {
// 			const { kid, publicKeyHex, type, meta, kms } = key;
// 			return { kid, publicKeyHex, type, meta, kms } as IKey;
// 		});
// 		return managedKeys;
// 	}
// }
//# sourceMappingURL=key-store-drizzle.js.map