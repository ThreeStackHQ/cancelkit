import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  db,
  flows,
  flowSteps,
  eq,
  and,
  desc,
} from "@cancelkit/db";
import { z } from "zod";
import { canCreateFlow, getUserTier } from "@/lib/tier";
import { PLANS } from "@/lib/stripe";

// ─── Validation Schemas ───────────────────────────────────────────────────────

const stepSchema = z.object({
  order: z.number().int().min(0),
  type: z.enum(["question", "offer", "confirmation"]),
  title: z.string().min(1).max(500),
  body: z.string().max(2000).optional().default(""),
  options: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional()
    .default([]),
  offerType: z.enum(["discount", "pause", "downgrade", "custom"]).optional(),
  offerValue: z.string().max(500).optional(),
});

const createFlowSchema = z.object({
  name: z.string().min(1).max(200),
  triggerType: z.enum(["cancel-button", "manual"]).default("cancel-button"),
  steps: z.array(stepSchema).optional().default([]),
});

// ─── GET /api/flows — list user's flows ───────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userFlows = await db
    .select()
    .from(flows)
    .where(eq(flows.userId, session.user.id))
    .orderBy(desc(flows.createdAt));

  return NextResponse.json({ flows: userFlows });
}

// ─── POST /api/flows — create flow ───────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await req.json();
  const parsed = createFlowSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { name, triggerType, steps } = parsed.data;

  // Enforce plan flow limit
  const allowed = await canCreateFlow(session.user.id);
  if (!allowed) {
    const tier = await getUserTier(session.user.id);
    const plan = PLANS[tier];
    return NextResponse.json(
      {
        error: "Flow limit reached",
        message: `Your ${plan.name} plan allows up to ${plan.flowLimit} flow${plan.flowLimit === 1 ? "" : "s"}. Upgrade to create more.`,
        limit: plan.flowLimit,
        currentTier: tier,
      },
      { status: 403 }
    );
  }

  // Create flow
  const [newFlow] = await db
    .insert(flows)
    .values({
      userId: session.user.id,
      name,
      triggerType,
      isActive: true,
    })
    .returning();

  if (!newFlow) {
    return NextResponse.json({ error: "Failed to create flow" }, { status: 500 });
  }

  // Create steps
  let createdSteps: (typeof flowSteps.$inferSelect)[] = [];
  if (steps.length > 0) {
    createdSteps = await db
      .insert(flowSteps)
      .values(
        steps.map((s) => ({
          flowId: newFlow.id,
          order: s.order,
          type: s.type,
          title: s.title,
          body: s.body,
          options: s.options,
          offerType: s.offerType ?? null,
          offerValue: s.offerValue ?? null,
        }))
      )
      .returning();
  }

  return NextResponse.json(
    { flow: { ...newFlow, steps: createdSteps } },
    { status: 201 }
  );
}
