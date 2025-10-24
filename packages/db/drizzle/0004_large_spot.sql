CREATE TABLE "horsepower_recipient_account_types" (
	"id" integer PRIMARY KEY NOT NULL,
	"table_name" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "horsepower_events" DROP CONSTRAINT "horsepower_events_the_firm_account_id_the_firm_accounts_id_fk";
--> statement-breakpoint
DROP INDEX "unique_one_time_events_per_account";--> statement-breakpoint
ALTER TABLE "horsepower_events" ADD COLUMN "recipient_account_type_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "horsepower_events" ADD COLUMN "recipient_account_id" text;--> statement-breakpoint
ALTER TABLE "horsepower_events" ADD COLUMN "new_horse_power_total" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "horsepower_events" ADD COLUMN "cast_hash" text;--> statement-breakpoint
CREATE UNIQUE INDEX "horsepower_recipient_account_type_table_name_unique" ON "horsepower_recipient_account_types" USING btree (LOWER("table_name"));--> statement-breakpoint
ALTER TABLE "horsepower_events" ADD CONSTRAINT "horsepower_events_recipient_account_type_id_horsepower_recipient_account_types_id_fk" FOREIGN KEY ("recipient_account_type_id") REFERENCES "public"."horsepower_recipient_account_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_one_time_events_per_account" ON "horsepower_events" USING btree ("recipient_account_id","horsepower_event_source_id") WHERE "horsepower_events"."horsepower_event_source_id" IN (1, 2, 3);--> statement-breakpoint
ALTER TABLE "employee_traits" DROP COLUMN "horse_power";--> statement-breakpoint
ALTER TABLE "horsepower_events" DROP COLUMN "the_firm_account_id";