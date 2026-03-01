import { NextRequest, NextResponse } from "next/server";
import { db, flows, flowSteps, flowEvents, eq } from "@cancelkit/db";
import { z } from "zod";

const eventSchema = z.object({
  flowId: z.string().uuid(),
  eventType: z.enum(["impression", "step_view", "save", "cancel", "answer"]),
  stepId: z.string().uuid().optional(),
  customerId: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional().default({}),
});

/**
 * POST /api/events
 *
 * Public endpoint — no auth required (events come from the widget).
 * Tracks user interactions with a cancel flow.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const body: unknown = await req.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { flowId, eventType, stepId, customerId, metadata } = parsed.data;

  // Validate flow exists
  const [flow] = await db
    .select({ id: flows.id })
    .from(flows)
    .where(eq(flows.id, flowId))
    .limit(1);

  if (!flow) {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }

  // Validate stepId if provided
  if (stepId) {
    const [step] = await db
      .select({ id: flowSteps.id })
      .from(flowSteps)
      .where(eq(flowSteps.id, stepId))
      .limit(1);

    if (!step) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }
  }

  const [event] = await db
    .insert(flowEvents)
    .values({
      flowId,
      stepId: stepId ?? null,
      customerId: customerId ?? null,
      eventType,
      metadata,
    })
    .returning();

  return NextResponse.json({ event }, { status: 201 });
}
