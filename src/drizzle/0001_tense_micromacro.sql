CREATE TABLE IF NOT EXISTS "claims" (
	"hash" varchar PRIMARY KEY NOT NULL,
	"issuanceDate" timestamp NOT NULL,
	"expirationDate" timestamp,
	"context" text[] NOT NULL,
	"credentialType" text[] NOT NULL,
	"value" text NOT NULL,
	"type" varchar NOT NULL,
	"isObj" boolean NOT NULL,
	"issuerDid" varchar,
	"subjectDid" varchar,
	"credentialHash" varchar NOT NULL,
	"witnessIndex" bigint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "identifiers" (
	"did" varchar PRIMARY KEY NOT NULL,
	"provider" varchar,
	"alias" varchar,
	"saveDate" timestamp NOT NULL,
	"updateDate" timestamp NOT NULL,
	"controllerKeyId" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "keys" (
	"kid" varchar PRIMARY KEY NOT NULL,
	"kms" varchar NOT NULL,
	"type" varchar NOT NULL,
	"publicKeyHex" varchar NOT NULL,
	"meta" text,
	"identifierDid" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "keyvaluestore" (
	"key" varchar PRIMARY KEY NOT NULL,
	"data" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "presentation" (
	"hash" varchar PRIMARY KEY NOT NULL,
	"raw" text NOT NULL,
	"id" varchar,
	"issuanceDate" timestamp,
	"expirationDate" timestamp,
	"context" text[] NOT NULL,
	"type" text[] NOT NULL,
	"holderDid" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "private_key" (
	"alias" varchar PRIMARY KEY NOT NULL,
	"type" varchar NOT NULL,
	"privateKeyHex" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "services" (
	"id" varchar PRIMARY KEY NOT NULL,
	"type" varchar NOT NULL,
	"serviceEndpoint" varchar NOT NULL,
	"description" varchar,
	"identifierDid" varchar
);
--> statement-breakpoint
ALTER TABLE "credentials" ADD COLUMN "issuanceDate" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "credentials" ADD COLUMN "expirationDate" timestamp;--> statement-breakpoint
ALTER TABLE "credentials" ADD COLUMN "context" text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "credentials" ADD COLUMN "type" text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "credentials" ADD COLUMN "issuerDid" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "credentials" ADD COLUMN "subjectDid" varchar;--> statement-breakpoint
ALTER TABLE "credentials" ADD COLUMN "witnessIndex" bigint;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "saveDate" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "updateDate" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "createdAt" timestamp;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "expiresAt" timestamp;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "threadId" varchar;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "type" varchar;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "data" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "replyTo" text[];--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "replyUrl" varchar;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "metaData" text[];--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "fromDid" varchar;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "toDid" varchar;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "claims" ADD CONSTRAINT "claims_issuerDid_identifiers_did_fk" FOREIGN KEY ("issuerDid") REFERENCES "public"."identifiers"("did") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "claims" ADD CONSTRAINT "claims_subjectDid_identifiers_did_fk" FOREIGN KEY ("subjectDid") REFERENCES "public"."identifiers"("did") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "claims" ADD CONSTRAINT "claims_credentialHash_credentials_hash_fk" FOREIGN KEY ("credentialHash") REFERENCES "public"."credentials"("hash") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "presentation" ADD CONSTRAINT "presentation_holderDid_identifiers_did_fk" FOREIGN KEY ("holderDid") REFERENCES "public"."identifiers"("did") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_6098cca69c838d91e55ef32fe1" ON "identifiers" USING btree ("provider","alias");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_f4824d8a354cbf404f1cbebe02" ON "keyvaluestore" USING btree ("key");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "credentials" ADD CONSTRAINT "credentials_issuerDid_identifiers_did_fk" FOREIGN KEY ("issuerDid") REFERENCES "public"."identifiers"("did") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "credentials" ADD CONSTRAINT "credentials_subjectDid_identifiers_did_fk" FOREIGN KEY ("subjectDid") REFERENCES "public"."identifiers"("did") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_fromDid_identifiers_did_fk" FOREIGN KEY ("fromDid") REFERENCES "public"."identifiers"("did") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_toDid_identifiers_did_fk" FOREIGN KEY ("toDid") REFERENCES "public"."identifiers"("did") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
