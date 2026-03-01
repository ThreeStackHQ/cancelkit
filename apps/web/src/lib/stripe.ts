import Stripe from "stripe";

// ─── Lazy Stripe Singleton ────────────────────────────────────────────────────

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return _stripe;
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export type PlanTier = "free" | "indie" | "pro";

export interface Plan {
  id: PlanTier;
  name: string;
  priceMonthly: number; // USD cents
  stripePriceId: string | null; // null for free
  flowLimit: number; // -1 = unlimited
  savesMonthlyLimit: number; // -1 = unlimited
  abTesting: boolean;
}

export const PLANS: Record<PlanTier, Plan> = {
  free: {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    stripePriceId: null,
    flowLimit: 1,
    savesMonthlyLimit: 50,
    abTesting: false,
  },
  indie: {
    id: "indie",
    name: "Indie",
    priceMonthly: 900, // $9.00
    stripePriceId: process.env.STRIPE_INDIE_PRICE_ID ?? null,
    flowLimit: 3,
    savesMonthlyLimit: -1, // unlimited
    abTesting: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 2900, // $29.00
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    flowLimit: -1, // unlimited
    savesMonthlyLimit: -1, // unlimited
    abTesting: true,
  },
};
