CREATE EXTENSION IF NOT EXISTS pg_uuidv7;--> statement-breakpoint
CREATE TABLE "account_wallet_trackers" (
	"tracker_the_firm_account_id" uuid NOT NULL,
	"tracked_wallet_id" uuid NOT NULL,
	"max_spend" numeric(78, 0) NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3),
	CONSTRAINT "account_wallet_trackers_tracker_the_firm_account_id_tracked_wallet_id_pk" PRIMARY KEY("tracker_the_firm_account_id","tracked_wallet_id")
);
--> statement-breakpoint
CREATE TABLE "account_farcaster_trackers" (
	"tracker_the_firm_account_id" uuid NOT NULL,
	"tracked_fid" integer NOT NULL,
	"max_spend" numeric(78, 0) NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3),
	CONSTRAINT "account_farcaster_trackers_tracker_the_firm_account_id_tracked_fid_pk" PRIMARY KEY("tracker_the_firm_account_id","tracked_fid")
);
--> statement-breakpoint
CREATE TABLE "farcaster_accounts_wallets" (
	"farcaster_account_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "farcaster_accounts_wallets_farcaster_account_id_wallet_id_pk" PRIMARY KEY("farcaster_account_id","wallet_id")
);
--> statement-breakpoint
CREATE TABLE "farcaster_accounts_x_accounts" (
	"farcaster_account_id" uuid NOT NULL,
	"x_account_id" uuid NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "farcaster_accounts_x_accounts_farcaster_account_id_x_account_id_pk" PRIMARY KEY("farcaster_account_id","x_account_id")
);
--> statement-breakpoint
CREATE TABLE "employee_cohorts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3),
	CONSTRAINT "employee_cohorts_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "employee_departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3),
	CONSTRAINT "employee_departments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "employee_personalizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"the_firm_account_id" uuid NOT NULL,
	"e_signature_image" text NOT NULL,
	"inspirational_quote" text NOT NULL,
	"office_requirements" text[],
	"department_id" integer NOT NULL,
	"cohort_id" integer NOT NULL,
	"employee_trait_id" integer NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3),
	CONSTRAINT "employee_personalizations_the_firm_account_id_unique" UNIQUE("the_firm_account_id"),
	CONSTRAINT "employee_personalizations_employee_trait_id_unique" UNIQUE("employee_trait_id")
);
--> statement-breakpoint
CREATE TABLE "employee_traits" (
	"id" serial PRIMARY KEY NOT NULL,
	"horse_power" real DEFAULT 0.1 NOT NULL,
	"kidneys" integer DEFAULT 2 NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "farcaster_accounts" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"username" text NOT NULL,
	"display_name" text,
	"pfp_url" text,
	"follower_count" integer,
	"fid" integer NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "farcaster_accounts_username_unique" UNIQUE("username"),
	CONSTRAINT "farcaster_accounts_fid_unique" UNIQUE("fid")
);
--> statement-breakpoint
CREATE TABLE "the_firm_accounts" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"privy_user_id" text NOT NULL,
	"farcaster_account_id" uuid,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3),
	CONSTRAINT "the_firm_accounts_privy_user_id_unique" UNIQUE("privy_user_id")
);
--> statement-breakpoint
CREATE TABLE "the_firm_accounts_wallets" (
	"the_firm_account_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "the_firm_accounts_wallets_the_firm_account_id_wallet_id_pk" PRIMARY KEY("the_firm_account_id","wallet_id")
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"address" text NOT NULL,
	"verification_source_id" integer,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "x_accounts" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"username" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blocks" (
	"number" bigint PRIMARY KEY NOT NULL,
	"timestamp" timestamp (3),
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"address" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deployer_account_types" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"table_name" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farcaster_notification_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"fid" integer NOT NULL,
	"notification_token" text,
	"notification_url" text,
	"is_mini_app_added" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "farcaster_notification_webhook_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"fid" integer NOT NULL,
	"notification_token" text,
	"notification_url" text,
	"is_mini_app_added" boolean,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tokens" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"address" text NOT NULL,
	"image_url" text,
	"score" real,
	"deployment_transaction_hash" text NOT NULL,
	"deployment_contract_id" uuid NOT NULL,
	"deployer_account_type_id" integer NOT NULL,
	"deployer_account_id" text NOT NULL,
	"creator_token_index" integer NOT NULL,
	"total_supply" bigint NOT NULL,
	"block" bigint NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "total_supply_positive" CHECK ("tokens"."total_supply" >= 0)
);
--> statement-breakpoint
CREATE TABLE "uniswap_versions" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_sources" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wire_tap_session_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"wire_tap_account_id" uuid NOT NULL,
	"encrypted_session_key" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3),
	CONSTRAINT "wire_tap_session_keys_encrypted_session_key_unique" UNIQUE("encrypted_session_key")
);
--> statement-breakpoint
CREATE TABLE "pools" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"token_id" uuid NOT NULL,
	"currency_id" uuid NOT NULL,
	"pool_address" text NOT NULL,
	"is_primary" boolean NOT NULL,
	"fee_bps" integer NOT NULL,
	"starting_mcap_usd" double precision NOT NULL,
	"ath_mcap_usd" double precision NOT NULL,
	"uniswap_version_id" integer NOT NULL,
	"starting_tick" integer,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"address" text NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"decimals" integer NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "horsepower_event_sources" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "horsepower_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"horsepower_event_source_id" integer NOT NULL,
	"the_firm_account_id" uuid NOT NULL,
	"horse_power_awarded" integer NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
ALTER TABLE "account_wallet_trackers" ADD CONSTRAINT "account_wallet_trackers_tracker_the_firm_account_id_the_firm_accounts_id_fk" FOREIGN KEY ("tracker_the_firm_account_id") REFERENCES "public"."the_firm_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_wallet_trackers" ADD CONSTRAINT "account_wallet_trackers_tracked_wallet_id_wallets_id_fk" FOREIGN KEY ("tracked_wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_farcaster_trackers" ADD CONSTRAINT "account_farcaster_trackers_tracker_the_firm_account_id_the_firm_accounts_id_fk" FOREIGN KEY ("tracker_the_firm_account_id") REFERENCES "public"."the_firm_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_farcaster_trackers" ADD CONSTRAINT "account_farcaster_trackers_tracked_fid_farcaster_accounts_fid_fk" FOREIGN KEY ("tracked_fid") REFERENCES "public"."farcaster_accounts"("fid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farcaster_accounts_wallets" ADD CONSTRAINT "farcaster_accounts_wallets_farcaster_account_id_farcaster_accounts_id_fk" FOREIGN KEY ("farcaster_account_id") REFERENCES "public"."farcaster_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farcaster_accounts_wallets" ADD CONSTRAINT "farcaster_accounts_wallets_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farcaster_accounts_x_accounts" ADD CONSTRAINT "farcaster_accounts_x_accounts_farcaster_account_id_farcaster_accounts_id_fk" FOREIGN KEY ("farcaster_account_id") REFERENCES "public"."farcaster_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farcaster_accounts_x_accounts" ADD CONSTRAINT "farcaster_accounts_x_accounts_x_account_id_x_accounts_id_fk" FOREIGN KEY ("x_account_id") REFERENCES "public"."x_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_personalizations" ADD CONSTRAINT "employee_personalizations_the_firm_account_id_the_firm_accounts_id_fk" FOREIGN KEY ("the_firm_account_id") REFERENCES "public"."the_firm_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_personalizations" ADD CONSTRAINT "employee_personalizations_department_id_employee_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."employee_departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_personalizations" ADD CONSTRAINT "employee_personalizations_cohort_id_employee_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."employee_cohorts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_personalizations" ADD CONSTRAINT "employee_personalizations_employee_trait_id_employee_traits_id_fk" FOREIGN KEY ("employee_trait_id") REFERENCES "public"."employee_traits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "the_firm_accounts" ADD CONSTRAINT "the_firm_accounts_farcaster_account_id_farcaster_accounts_id_fk" FOREIGN KEY ("farcaster_account_id") REFERENCES "public"."farcaster_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "the_firm_accounts_wallets" ADD CONSTRAINT "the_firm_accounts_wallets_the_firm_account_id_the_firm_accounts_id_fk" FOREIGN KEY ("the_firm_account_id") REFERENCES "public"."the_firm_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "the_firm_accounts_wallets" ADD CONSTRAINT "the_firm_accounts_wallets_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_verification_source_id_verification_sources_id_fk" FOREIGN KEY ("verification_source_id") REFERENCES "public"."verification_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_deployment_contract_id_contracts_id_fk" FOREIGN KEY ("deployment_contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_deployer_account_type_id_deployer_account_types_id_fk" FOREIGN KEY ("deployer_account_type_id") REFERENCES "public"."deployer_account_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_block_blocks_number_fk" FOREIGN KEY ("block") REFERENCES "public"."blocks"("number") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wire_tap_session_keys" ADD CONSTRAINT "wire_tap_session_keys_wire_tap_account_id_the_firm_accounts_id_fk" FOREIGN KEY ("wire_tap_account_id") REFERENCES "public"."the_firm_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pools" ADD CONSTRAINT "pools_token_id_tokens_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."tokens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pools" ADD CONSTRAINT "pools_currency_id_currencies_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pools" ADD CONSTRAINT "pools_uniswap_version_id_uniswap_versions_id_fk" FOREIGN KEY ("uniswap_version_id") REFERENCES "public"."uniswap_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horsepower_events" ADD CONSTRAINT "horsepower_events_horsepower_event_source_id_horsepower_event_sources_id_fk" FOREIGN KEY ("horsepower_event_source_id") REFERENCES "public"."horsepower_event_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horsepower_events" ADD CONSTRAINT "horsepower_events_the_firm_account_id_the_firm_accounts_id_fk" FOREIGN KEY ("the_firm_account_id") REFERENCES "public"."the_firm_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "department_id_idx" ON "employee_personalizations" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "cohort_id_idx" ON "employee_personalizations" USING btree ("cohort_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wallets_address_lower_unique" ON "wallets" USING btree (lower("address"));--> statement-breakpoint
CREATE UNIQUE INDEX "contracts_address_lower_unique" ON "contracts" USING btree (lower("address"));--> statement-breakpoint
CREATE UNIQUE INDEX "deployer_account_type_name_unique" ON "deployer_account_types" USING btree (LOWER("name"));--> statement-breakpoint
CREATE UNIQUE INDEX "deployer_account_type_table_name_unique" ON "deployer_account_types" USING btree (LOWER("table_name"));--> statement-breakpoint
CREATE UNIQUE INDEX "farcaster_notification_tokens_fid_idx" ON "farcaster_notification_tokens" USING btree ("fid");--> statement-breakpoint
CREATE UNIQUE INDEX "tokens_address_lower_unique" ON "tokens" USING btree (lower("address"));--> statement-breakpoint
CREATE INDEX "tokens_created_at_idx" ON "tokens" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uniswap_version_name_unique" ON "uniswap_versions" USING btree (LOWER("name"));--> statement-breakpoint
CREATE UNIQUE INDEX "verification_source_name_unique" ON "verification_sources" USING btree (LOWER("name"));--> statement-breakpoint
CREATE UNIQUE INDEX "wire_tap_session_keys_wire_tap_account_id_active_unique" ON "wire_tap_session_keys" USING btree ("wire_tap_account_id") WHERE "wire_tap_session_keys"."is_active" IS TRUE;--> statement-breakpoint
CREATE UNIQUE INDEX "pools_address_lower_unique" ON "pools" USING btree (lower("pool_address"));--> statement-breakpoint
CREATE UNIQUE INDEX "currencies_address_lower_unique" ON "currencies" USING btree (lower("address"));--> statement-breakpoint
CREATE UNIQUE INDEX "horsepower_event_source_name_unique" ON "horsepower_event_sources" USING btree (LOWER("name"));--> statement-breakpoint
CREATE UNIQUE INDEX "unique_one_time_events_per_account" ON "horsepower_events" USING btree ("the_firm_account_id","horsepower_event_source_id") WHERE "horsepower_events"."horsepower_event_source_id" IN (1, 2, 3);