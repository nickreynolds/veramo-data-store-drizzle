CREATE TABLE IF NOT EXISTS "messages_to_presentations" (
	"messageId" varchar NOT NULL,
	"presentationHash" varchar NOT NULL,
	CONSTRAINT "PK_9dc4cc025ec7163ec5ca919d140" PRIMARY KEY("messageId","presentationHash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "presentations_to_credentials" (
	"presentationHash" varchar NOT NULL,
	"credentialHash" varchar NOT NULL,
	CONSTRAINT "PK_32d9cee791ee1139f29fd94b5c4" PRIMARY KEY("presentationHash","credentialHash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "presentation_to_verifier_identifier" (
	"presentationHash" varchar NOT NULL,
	"identifierDid" varchar NOT NULL,
	CONSTRAINT "PK_c3b760612b992bc75511d74f6a9" PRIMARY KEY("presentationHash","identifierDid")
);
--> statement-breakpoint
ALTER TABLE "presentation" RENAME TO "presentations";--> statement-breakpoint
ALTER TABLE "private_key" RENAME TO "private_keys";--> statement-breakpoint
ALTER TABLE "presentations" DROP CONSTRAINT "presentation_holderDid_identifiers_did_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages_to_presentations" ADD CONSTRAINT "messages_to_presentations_messageId_messages_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages_to_presentations" ADD CONSTRAINT "messages_to_presentations_presentationHash_presentations_hash_fk" FOREIGN KEY ("presentationHash") REFERENCES "public"."presentations"("hash") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "presentations_to_credentials" ADD CONSTRAINT "presentations_to_credentials_presentationHash_presentations_hash_fk" FOREIGN KEY ("presentationHash") REFERENCES "public"."presentations"("hash") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "presentations_to_credentials" ADD CONSTRAINT "presentations_to_credentials_credentialHash_credentials_hash_fk" FOREIGN KEY ("credentialHash") REFERENCES "public"."credentials"("hash") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "presentation_to_verifier_identifier" ADD CONSTRAINT "presentation_to_verifier_identifier_presentationHash_presentations_hash_fk" FOREIGN KEY ("presentationHash") REFERENCES "public"."presentations"("hash") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "presentation_to_verifier_identifier" ADD CONSTRAINT "presentation_to_verifier_identifier_identifierDid_identifiers_did_fk" FOREIGN KEY ("identifierDid") REFERENCES "public"."identifiers"("did") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "IDX_9dc4cc025ec7163ec5ca919d14" ON "messages_to_presentations" USING btree ("messageId","presentationHash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "IDX_32d9cee791ee1139f29fd94b5c" ON "presentations_to_credentials" USING btree ("presentationHash","credentialHash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "IDX_c3b760612b992bc75511d74f6a" ON "presentation_to_verifier_identifier" USING btree ("presentationHash","identifierDid");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "presentations" ADD CONSTRAINT "presentations_holderDid_identifiers_did_fk" FOREIGN KEY ("holderDid") REFERENCES "public"."identifiers"("did") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
