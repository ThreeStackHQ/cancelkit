import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe, PLANS } from "@/lib/stripe";
import { db, subscriptions, users, eq } from "@cancelkit/db";
import { z } from "zod";

const checkoutSchema = z.object({
  tier: z.enum(["indie", "pro"]),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout session for indie or pro plan.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { tier, successUrl, cancelUrl } = parsed.data;
  const plan = PLANS[tier];

  if (!plan.stripePriceId) {
    return NextResponse.json(
      { error: `No Stripe price ID configured for ${tier} plan. Set STRIPE_${tier.toUpperCase()}_PRICE_ID env var.` },
      { status: 400 }
    );
  }

  const stripe = getStripe();

  // Find or create Stripe customer
  let stripeCustomerId: string | null = null;

  const [existingSub] = await db
    .select({ stripeCustomerId: subscriptions.stripeCustomerId })
    .from(subscriptions)
    .where(eq(subscriptions.userId, session.user.id))
    .limit(1);

  if (existingSub?.stripeCustomerId) {
    stripeCustomerId = existingSub.stripeCustomerId;
  } else {
    // Create new customer
    const customer = await stripe.customers.create({
      email: session.user.email,
      metadata: { cancelkit_user_id: session.user.id },
    });
    stripeCustomerId = customer.id;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    success_url: successUrl ?? `${appUrl}/dashboard?upgraded=true`,
    cancel_url: cancelUrl ?? `${appUrl}/pricing`,
    subscription_data: {
      metadata: {
        cancelkit_user_id: session.user.id,
        tier,
      },
    },
  });

  return NextResponse.json(
    { url: checkoutSession.url, sessionId: checkoutSession.id },
    { status: 200 }
  );
}
