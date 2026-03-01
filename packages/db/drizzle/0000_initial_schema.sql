-- CancelKit Initial Schema Migration
-- Reconciled with packages/db/src/schema.ts [wave13]

-- ─── Enums ────────────────────────────────────────────────────────────────────

CREATE TYPE "step_type" AS ENUM ('question', 'offer', 'confirmation');
CREATE TYPE "event_type" AS ENUM ('impression', 'step_view', 'save', 'cancel', 'answer');
CREATE TYPE "tier" AS ENUM ('free', 'indie', 'pro');
CREATE TYPE "trigger_type" AS ENUM ('cancel-button', 'manual');
CREATE TYPE "offer_type" AS ENUM ('discount', 'pause', 'downgrade', 'custom');

-- ─── Users ────────────────────────────────────────────────────────────────────

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text NOT NULL UNIQUE,
  "name" text,
  "image" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

-- ─── Flows ────────────────────────────────────────────────────────────────────

CREATE TABLE "flows" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "trigger_type" "trigger_type" NOT NULL DEFAULT 'cancel-button',
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "flows_user_id_idx" ON "flows" ("user_id");

-- ─── Flow Steps ───────────────────────────────────────────────────────────────

CREATE TABLE "flow_steps" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "flow_id" uuid NOT NULL REFERENCES "flows"("id") ON DELETE CASCADE,
  "order" integer NOT NULL,
  "type" "step_type" NOT NULL,
  "title" text NOT NULL DEFAULT '',
  "body" text DEFAULT '',
  "options" jsonb DEFAULT '[]',
  "offer_type" "offer_type",
  "offer_value" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "flow_steps_flow_id_idx" ON "flow_steps" ("flow_id");

-- ─── Flow Events ──────────────────────────────────────────────────────────────

CREATE TABLE "flow_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "flow_id" uuid NOT NULL REFERENCES "flows"("id") ON DELETE CASCADE,
  "step_id" uuid REFERENCES "flow_steps"("id") ON DELETE SET NULL,
  "customer_id" text,
  "event_type" "event_type" NOT NULL,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "flow_events_flow_id_idx" ON "flow_events" ("flow_id");
CREATE INDEX "flow_events_event_type_idx" ON "flow_events" ("event_type");
CREATE INDEX "flow_events_created_at_idx" ON "flow_events" ("created_at");

-- ─── Workspace Settings ───────────────────────────────────────────────────────

CREATE TABLE "workspace_settings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "stripe_secret_key_encrypted" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- ─── Subscriptions ────────────────────────────────────────────────────────────

CREATE TABLE "subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "tier" "tier" NOT NULL DEFAULT 'free',
  "status" text NOT NULL DEFAULT 'active',
  "stripe_customer_id" text,
  "stripe_subscription_id" text,
  "current_period_end" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" ("user_id");
CREATE UNIQUE INDEX "subscriptions_stripe_customer_id_idx" ON "subscriptions" ("stripe_customer_id");
