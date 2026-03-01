import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  db,
  flows,
  flowSteps,
  eq,
  and,
  asc,
} from "@cancelkit/db";
import { z } from "zod";

interface RouteContext {
  params: { id: string };
}

// ─── Validation Schemas ───────────────────────────────────────────────────────

const stepUpsertSchema = z.object({
  id: z.string().uuid().optional(), // existing step id for updates
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

const updateFlowSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  triggerType: z.enum(["cancel-button", "manual"]).optional(),
  isActive: z.boolean().optional(),
  steps: z.array(stepUpsertSchema).optional(),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getOwnedFlow(flowId: string, userId: string) {
  const [flow] = await db
    .select()
    .from(flows)
    .where(and(eq(flows.id, flowId), eq(flows.userId, userId)))
    .limit(1);
  return flow ?? null;
}

// ─── GET /api/flows/:id ───────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const flow = await getOwnedFlow(params.id, session.user.id);
  if (!flow) {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }

  const steps = await db
    .select()
    .from(flowSteps)
    .where(eq(flowSteps.flowId, flow.id))
    .orderBy(asc(flowSteps.order));

  return NextResponse.json({ flow: { ...flow, steps } });
}

// ─── PATCH /api/flows/:id ─────────────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const flow = await getOwnedFlow(params.id, session.user.id);
  if (!flow) {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }

  const body: unknown = await req.json();
  const parsed = updateFlowSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { name, triggerType, isActive, steps } = parsed.data;

  // Update flow fields
  const updateData: Partial<typeof flows.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (name !== undefined) updateData.name = name;
  if (triggerType !== undefined) updateData.triggerType = triggerType;
  if (isActive !== undefined) updateData.isActive = isActive;

  const [updatedFlow] = await db
    .update(flows)
    .set(updateData)
    .where(eq(flows.id, flow.id))
    .returning();

  // Replace steps if provided
  let updatedSteps: (typeof flowSteps.$inferSelect)[] = [];
  if (steps !== undefined) {
    // Delete existing steps and re-insert (simpler than partial upsert)
    await db.delete(flowSteps).where(eq(flowSteps.flowId, flow.id));

    if (steps.length > 0) {
      updatedSteps = await db
        .insert(flowSteps)
        .values(
          steps.map((s) => ({
            flowId: flow.id,
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
  } else {
    updatedSteps = await db
      .select()
      .from(flowSteps)
      .where(eq(flowSteps.flowId, flow.id))
      .orderBy(asc(flowSteps.order));
  }

  return NextResponse.json({ flow: { ...updatedFlow, steps: updatedSteps } });
}

// ─── DELETE /api/flows/:id ────────────────────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const flow = await getOwnedFlow(params.id, session.user.id);
  if (!flow) {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }

  await db.delete(flows).where(eq(flows.id, flow.id));

  return new NextResponse(null, { status: 204 });
}
