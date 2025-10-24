ALTER TABLE "pools" ADD COLUMN "token0_is_new_token" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "pools" ADD COLUMN "pool_hook" text;--> statement-breakpoint
ALTER TABLE "pools" ADD COLUMN "tick_spacing" integer;--> statement-breakpoint
ALTER TABLE "pools" ADD CONSTRAINT "uniswap_v4_check" CHECK (
      (
        "pools"."uniswap_version_id" = 2
        AND "pools"."pool_hook" IS NOT NULL
        AND "pools"."tick_spacing" IS NOT NULL
      )
      OR
      (
        "pools"."uniswap_version_id" = 1
      ));