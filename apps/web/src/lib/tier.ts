import { db, subscriptions, flows, eq, and, sql } from "@cancelkit/db";
import { PLANS, type PlanTier } from "./stripe";

// ─── getUserTier ──────────────────────────────────────────────────────────────

/**
 * Returns the active tier for a user.
 * Falls back to "free" if no subscription record exists.
 */
export async function getUserTier(userId: string): Promise<PlanTier> {
  const [sub] = await db
    .select({ tier: subscriptions.tier, status: subscriptions.status })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (!sub) return "free";

  // If subscription is canceled / past_due with expired period, fall back
  if (
    sub.status === "canceled" ||
    sub.status === "unpaid"
  ) {
    return "free";
  }

  return (sub.tier as PlanTier) ?? "free";
}

// ─── canCreateFlow ────────────────────────────────────────────────────────────

/**
 * Returns true if the user can create another flow given their tier's limit.
 */
export async function canCreateFlow(userId: string): Promise<boolean> {
  const tier = await getUserTier(userId);
  const plan = PLANS[tier];

  if (plan.flowLimit === -1) return true; // unlimited

  const [result] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(flows)
    .where(and(eq(flows.userId, userId)));

  const current = result?.count ?? 0;
  return current < plan.flowLimit;
}

// ─── getMonthlyFlowLimit ──────────────────────────────────────────────────────

/**
 * Returns the max number of flows for the user's tier (-1 = unlimited).
 */
export async function getMonthlyFlowLimit(userId: string): Promise<number> {
  const tier = await getUserTier(userId);
  return PLANS[tier].flowLimit;
}
