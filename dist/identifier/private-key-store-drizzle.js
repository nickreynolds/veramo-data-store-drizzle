"use strict";
// import {
// 	AbstractPrivateKeyStore,
// 	AbstractSecretBox,
// 	ImportablePrivateKey,
// 	ManagedPrivateKey,
// } from "@veramo/key-manager";
// // import Debug from 'debug'
// import { OrPromise } from "@veramo/utils";
// import { eq } from "drizzle-orm";
// import { DataSource } from "typeorm";
// import { v4 as uuid4 } from "uuid";
// import { db } from "../drizzle/db";
// import { key, privateKey } from "../drizzle/schema";
// import { PrivateKey } from "../entities/private-key";
// import { getConnectedDb } from "../utils";
// // const debug = Debug('veramo:typeorm:key-store')
// /**
//  * An implementation of {@link @veramo/key-manager#AbstractPrivateKeyStore | AbstractPrivateKeyStore} that uses a
//  * TypeORM database connection to store private key material.
//  *
//  * The keys can be encrypted while at rest if this class is initialized with an
//  * {@link @veramo/key-manager#AbstractSecretBox | AbstractSecretBox} implementation.
//  *
//  * @public
//  */
// export class PrivateKeyStore extends AbstractPrivateKeyStore {
// 	constructor(
// 		private dbConnection: OrPromise<DataSource>,
// 		private secretBox?: AbstractSecretBox,
// 	) {
// 		super();
// 		if (!secretBox) {
// 			console.warn("Please provide SecretBox to the KeyStore");
// 		}
// 	}
// 	async getKey({ alias }: { alias: string }): Promise<ManagedPrivateKey> {
// 		const key1 = await db.query.privateKey.findFirst({
// 			// biome-ignore lint: ok
// 			where: (key: any, { eq }: any) => eq(key.alias, alias),
// 		});
// 		if (!key1) throw Error("Key not found");
// 		if (this.secretBox && key1.privateKeyHex) {
// 			key1.privateKeyHex = await this.secretBox.decrypt(key1.privateKeyHex);
// 		}
// 		return key1 as ManagedPrivateKey;
// 	}
// 	async deleteKey({ alias }: { alias: string }) {
// 		const key1 = await db.query.privateKey.findFirst({
// 			// biome-ignore lint: ok
// 			where: (key: any, { eq }: any) => eq(key.alias, alias),
// 		});
// 		if (!key1)
// 			throw Error(`not_found: Private Key data not found for alias=${alias}`);
// 		console.log("Deleting private key data", alias);
// 		await db.delete(privateKey).where(eq(privateKey.alias, alias));
// 		return true;
// 	}
// 	async importKey(args: ImportablePrivateKey): Promise<ManagedPrivateKey> {
// 		const key = new PrivateKey();
// 		key.alias = args.alias || uuid4();
// 		key.privateKeyHex = args.privateKeyHex;
// 		key.type = args.type;
// 		console.log("Saving private key data", args.alias);
// 		const keyRepo = await (
// 			await getConnectedDb(this.dbConnection)
// 		).getRepository(PrivateKey);
// 		const existingKey = await keyRepo.findOneBy({ alias: key.alias });
// 		if (existingKey && this.secretBox) {
// 			existingKey.privateKeyHex = await this.secretBox.decrypt(
// 				existingKey.privateKeyHex,
// 			);
// 		}
// 		if (existingKey && existingKey.privateKeyHex !== key.privateKeyHex) {
// 			throw new Error(
// 				// biome-ignore lint: ok
// 				`key_already_exists: A key with this alias exists but with different data. Please use a different alias.`,
// 			);
// 		}
// 		if (this.secretBox && key.privateKeyHex) {
// 			key.privateKeyHex = await this.secretBox.encrypt(key.privateKeyHex);
// 		}
// 		await keyRepo.save(key);
// 		return key;
// 	}
// 	async listKeys(): Promise<Array<ManagedPrivateKey>> {
// 		// biome-ignore lint: ok
// 		let keys = await (await getConnectedDb(this.dbConnection))
// 			.getRepository(PrivateKey)
// 			.find();
// 		if (this.secretBox) {
// 			for (const key of keys) {
// 				key.privateKeyHex = (await this.secretBox?.decrypt(
// 					key.privateKeyHex,
// 				)) as string;
// 			}
// 		}
// 		return keys;
// 	}
// }
//# sourceMappingURL=private-key-store-drizzle.js.map