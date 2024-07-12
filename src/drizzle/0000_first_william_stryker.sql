CREATE TABLE IF NOT EXISTS "credentials" (
	"hash" varchar PRIMARY KEY NOT NULL,
	"raw" text NOT NULL,
	"id" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "credentials_to_messages" (
	"message_id" varchar NOT NULL,
	"credential_hash" varchar NOT NULL,
	CONSTRAINT "PK_primaryKeyIdHash" PRIMARY KEY("message_id","credential_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" varchar PRIMARY KEY NOT NULL,
	"raw" varchar
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "credentials_to_messages" ADD CONSTRAINT "credentials_to_messages_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "credentials_to_messages" ADD CONSTRAINT "credentials_to_messages_credential_hash_credentials_hash_fk" FOREIGN KEY ("credential_hash") REFERENCES "public"."credentials"("hash") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "IDX_indexIdHash" ON "credentials_to_messages" USING btree ("message_id","credential_hash");