import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const stepTypeEnum = pgEnum("step_type", [
  "question",
  "offer",
  "confirmation",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "impression",
  "step_view",
  "save",
  "cancel",
  "answer",
]);

export const tierEnum = pgEnum("tier", ["free", "indie", "pro"]);

export const triggerTypeEnum = pgEnum("trigger_type", [
  "cancel-button",
  "manual",
]);

export const offerTypeEnum = pgEnum("offer_type", [
  "discount",
  "pause",
  "downgrade",
  "custom",
]);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Flows ────────────────────────────────────────────────────────────────────

export const flows = pgTable("flows", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  triggerType: triggerTypeEnum("trigger_type").default("cancel-button").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Flow Steps ───────────────────────────────────────────────────────────────

export const flowSteps = pgTable("flow_steps", {
  id: uuid("id").defaultRandom().primaryKey(),
  flowId: uuid("flow_id")
    .notNull()
    .references(() => flows.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  type: stepTypeEnum("type").notNull(),
  title: text("title").notNull().default(""),
  body: text("body").default(""),
  options: jsonb("options").default([]), // for question steps: [{label, value}]
  offerType: offerTypeEnum("offer_type"), // for offer steps
  offerValue: text("offer_value"), // discount %, pause duration, price_id
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Flow Events ──────────────────────────────────────────────────────────────

export const flowEvents = pgTable("flow_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  flowId: uuid("flow_id")
    .notNull()
    .references(() => flows.id, { onDelete: "cascade" }),
  stepId: uuid("step_id").references(() => flowSteps.id, {
    onDelete: "set null",
  }),
  customerId: text("customer_id"), // end-user/Stripe customer identifier
  eventType: eventTypeEnum("event_type").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Workspace Settings ───────────────────────────────────────────────────────

export const workspaceSettings = pgTable("workspace_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  // AES-256-GCM encrypted Stripe secret key: "iv:authTag:ciphertext" (hex)
  stripeSecretKeyEncrypted: text("stripe_secret_key_encrypted"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tier: tierEnum("tier").default("free").notNull(),
  status: text("status").notNull().default("active"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Flow = typeof flows.$inferSelect;
export type NewFlow = typeof flows.$inferInsert;

export type FlowStep = typeof flowSteps.$inferSelect;
export type NewFlowStep = typeof flowSteps.$inferInsert;

export type FlowEvent = typeof flowEvents.$inferSelect;
export type NewFlowEvent = typeof flowEvents.$inferInsert;

export type WorkspaceSettings = typeof workspaceSettings.$inferSelect;
export type NewWorkspaceSettings = typeof workspaceSettings.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
