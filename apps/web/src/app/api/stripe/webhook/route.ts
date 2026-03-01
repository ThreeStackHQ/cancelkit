import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { db, subscriptions, eq } from "@cancelkit/db";

type PlanTier = "free" | "indie" | "pro";

function tierFromMetadata(metadata: Stripe.Metadata | null): PlanTier {
  const t = metadata?.tier as string | undefined;
  if (t === "indie" || t === "pro") return t;
  return "free";
}

async function upsertSubscription(opts: {
  userId: string;
  tier: PlanTier;
  status: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodEnd: Date | null;
}) {
  const [existing] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.userId, opts.userId))
    .limit(1);

  if (existing) {
    await db
      .update(subscriptions)
      .set({
        tier: opts.tier,
        status: opts.status,
        stripeCustomerId: opts.stripeCustomerId,
        stripeSubscriptionId: opts.stripeSubscriptionId,
        currentPeriodEnd: opts.currentPeriodEnd,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, opts.userId));
  } else {
    await db.insert(subscriptions).values({
      userId: opts.userId,
      tier: opts.tier,
      status: opts.status,
      stripeCustomerId: opts.stripeCustomerId,
      stripeSubscriptionId: opts.stripeSubscriptionId,
      currentPeriodEnd: opts.currentPeriodEnd,
    });
  }
}

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events for subscription lifecycle.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      event = await stripe.webhooks.constructEventAsync(rawBody, sig, webhookSecret);
    } else {
      // In dev without webhook secret, parse directly
      event = JSON.parse(rawBody) as Stripe.Event;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[webhook] Signature verification failed:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId = session.metadata?.cancelkit_user_id;
        if (!userId) {
          console.error("[webhook] No cancelkit_user_id in checkout session metadata");
          break;
        }

        const subscriptionId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null;

        const customerId = typeof session.customer === "string"
          ? session.customer
          : session.customer?.id ?? null;

        if (!subscriptionId || !customerId) {
          console.error("[webhook] Missing subscription/customer ID");
          break;
        }

        // Retrieve full subscription to get period end and metadata
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const tier = tierFromMetadata(sub.metadata);
        // In Stripe v20, current_period_end moved to SubscriptionItem
        const itemPeriodEnd = sub.items.data[0]?.current_period_end ?? null;

        await upsertSubscription({
          userId,
          tier,
          status: sub.status,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          currentPeriodEnd: itemPeriodEnd ? new Date(itemPeriodEnd * 1000) : null,
        });

        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.cancelkit_user_id;
        if (!userId) break;

        const customerId = typeof sub.customer === "string"
          ? sub.customer
          : sub.customer.id;

        const tier = tierFromMetadata(sub.metadata);
        // In Stripe v20, current_period_end moved to SubscriptionItem
        const periodEnd = sub.items.data[0]?.current_period_end ?? null;

        await upsertSubscription({
          userId,
          tier,
          status: sub.status,
          stripeCustomerId: customerId,
          stripeSubscriptionId: sub.id,
          currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        });

        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.cancelkit_user_id;
        if (!userId) break;

        const customerId = typeof sub.customer === "string"
          ? sub.customer
          : sub.customer.id;

        await upsertSubscription({
          userId,
          tier: "free",
          status: "canceled",
          stripeCustomerId: customerId,
          stripeSubscriptionId: sub.id,
          currentPeriodEnd: null,
        });

        break;
      }

      default:
        // Unhandled event type — return 200 to acknowledge
        break;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[webhook] Handler error:", message);
    return NextResponse.json({ error: "Internal handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
