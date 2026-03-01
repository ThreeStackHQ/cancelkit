import { NextRequest, NextResponse } from "next/server";
import { db, workspaceSettings, eq } from "@cancelkit/db";
import { decrypt } from "@/lib/crypto";
import { z } from "zod";
import Stripe from "stripe";

// ─── Validation ───────────────────────────────────────────────────────────────

const applyOfferSchema = z.object({
  customerId: z.string().min(1, "Stripe customer ID is required"),
  offerType: z.enum(["discount", "pause", "downgrade"]),
  offerValue: z.string().min(1, "Offer value is required"),
  // Optional: caller can pass their own Stripe key (overrides workspace setting)
  stripeSecretKey: z.string().optional(),
  // Required for discount/pause to find active subscriptions
  subscriptionId: z.string().optional(),
  // Required for finding the workspace's Stripe key via user lookup
  userId: z.string().uuid().optional(),
});

type ApplyOfferInput = z.infer<typeof applyOfferSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function resolveStripeKey(input: ApplyOfferInput): Promise<string | null> {
  // Caller-provided key takes priority
  if (input.stripeSecretKey) return input.stripeSecretKey;

  // Look up workspace settings by userId
  if (input.userId) {
    const [settings] = await db
      .select()
      .from(workspaceSettings)
      .where(eq(workspaceSettings.userId, input.userId))
      .limit(1);

    if (settings?.stripeSecretKeyEncrypted) {
      return decrypt(settings.stripeSecretKeyEncrypted);
    }
  }

  return null;
}

async function getActiveSubscription(
  stripe: Stripe,
  customerId: string,
  subscriptionId?: string
): Promise<Stripe.Subscription | null> {
  if (subscriptionId) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    return sub;
  }

  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 1,
  });

  return subs.data[0] ?? null;
}

// ─── POST /api/stripe/apply-offer ────────────────────────────────────────────

/**
 * Apply a retention offer to a Stripe customer:
 * - discount: create a percent-off coupon and apply to subscription
 * - pause: set pause_collection on the subscription
 * - downgrade: update subscription item to a lower price_id
 *
 * This endpoint is called by the widget when a user accepts an offer.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const body: unknown = await req.json();
  const parsed = applyOfferSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const input = parsed.data;

  const stripeKey = await resolveStripeKey(input);
  if (!stripeKey) {
    return NextResponse.json(
      {
        error:
          "No Stripe key available. Provide stripeSecretKey or configure one in workspace settings.",
      },
      { status: 400 }
    );
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

  try {
    switch (input.offerType) {
      case "discount": {
        // offerValue = percent off (e.g. "20" for 20%)
        const percentOff = parseFloat(input.offerValue);
        if (isNaN(percentOff) || percentOff <= 0 || percentOff > 100) {
          return NextResponse.json(
            { error: "offerValue must be a number 1-100 for discount" },
            { status: 400 }
          );
        }

        // Create a one-time coupon
        const coupon = await stripe.coupons.create({
          percent_off: percentOff,
          duration: "once",
          name: `CancelKit Retention ${percentOff}% Off`,
        });

        // Apply coupon to subscription
        const subscription = await getActiveSubscription(
          stripe,
          input.customerId,
          input.subscriptionId
        );

        if (!subscription) {
          return NextResponse.json(
            { error: "No active subscription found for this customer" },
            { status: 404 }
          );
        }

        const updated = await stripe.subscriptions.update(subscription.id, {
          coupon: coupon.id,
        });

        return NextResponse.json({
          success: true,
          message: `Applied ${percentOff}% discount to subscription`,
          stripeResponse: {
            subscriptionId: updated.id,
            couponId: coupon.id,
            status: updated.status,
          },
        });
      }

      case "pause": {
        // offerValue = number of months to pause (e.g. "1" or "3")
        const subscription = await getActiveSubscription(
          stripe,
          input.customerId,
          input.subscriptionId
        );

        if (!subscription) {
          return NextResponse.json(
            { error: "No active subscription found for this customer" },
            { status: 404 }
          );
        }

        const updated = await stripe.subscriptions.update(subscription.id, {
          pause_collection: {
            behavior: "keep_as_draft",
          },
        });

        return NextResponse.json({
          success: true,
          message: `Subscription paused (keep_as_draft)`,
          stripeResponse: {
            subscriptionId: updated.id,
            status: updated.status,
            pauseCollection: updated.pause_collection,
          },
        });
      }

      case "downgrade": {
        // offerValue = new price_id to downgrade to
        const priceId = input.offerValue;

        const subscription = await getActiveSubscription(
          stripe,
          input.customerId,
          input.subscriptionId
        );

        if (!subscription) {
          return NextResponse.json(
            { error: "No active subscription found for this customer" },
            { status: 404 }
          );
        }

        const subscriptionItemId = subscription.items.data[0]?.id;
        if (!subscriptionItemId) {
          return NextResponse.json(
            { error: "No subscription item found" },
            { status: 400 }
          );
        }

        const updated = await stripe.subscriptions.update(subscription.id, {
          items: [
            {
              id: subscriptionItemId,
              price: priceId,
            },
          ],
          proration_behavior: "create_prorations",
        });

        return NextResponse.json({
          success: true,
          message: `Subscription downgraded to plan ${priceId}`,
          stripeResponse: {
            subscriptionId: updated.id,
            status: updated.status,
          },
        });
      }

      default: {
        return NextResponse.json(
          { error: "Unknown offerType" },
          { status: 400 }
        );
      }
    }
  } catch (err: unknown) {
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { success: false, error: err.message, code: err.code },
        { status: err.statusCode ?? 500 }
      );
    }

    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
