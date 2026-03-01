import { NextRequest, NextResponse } from "next/server";
import { db, flows, flowSteps, eq, asc } from "@cancelkit/db";

interface RouteContext {
  params: { id: string };
}

/**
 * GET /api/public/flows/:id
 *
 * Public endpoint — no auth required.
 * Returns the flow configuration and its steps for the embed widget.
 */
export async function GET(
  _req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  const [flow] = await db
    .select()
    .from(flows)
    .where(eq(flows.id, params.id))
    .limit(1);

  if (!flow) {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }

  if (!flow.isActive) {
    return NextResponse.json({ error: "Flow is inactive" }, { status: 404 });
  }

  const steps = await db
    .select()
    .from(flowSteps)
    .where(eq(flowSteps.flowId, flow.id))
    .orderBy(asc(flowSteps.order));

  return NextResponse.json({
    flow: {
      id: flow.id,
      name: flow.name,
      triggerType: flow.triggerType,
    },
    steps: steps.map((s) => ({
      id: s.id,
      order: s.order,
      type: s.type,
      title: s.title,
      body: s.body,
      options: s.options,
      offerType: s.offerType,
      offerValue: s.offerValue,
    })),
  });
}
