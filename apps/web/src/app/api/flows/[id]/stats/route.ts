import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  db,
  flows,
  flowSteps,
  flowEvents,
  eq,
  and,
  sql,
  inArray,
} from "@cancelkit/db";

interface RouteContext {
  params: { id: string };
}

/**
 * GET /api/flows/:id/stats
 *
 * Returns aggregated event stats for a flow:
 * { impressions, saves, cancels, saveRate, steps: [{stepId, views, answers}] }
 */
export async function GET(
  _req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const [flow] = await db
    .select()
    .from(flows)
    .where(and(eq(flows.id, params.id), eq(flows.userId, session.user.id)))
    .limit(1);

  if (!flow) {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }

  // Top-level event counts
  const [counts] = await db
    .select({
      impressions: sql<string>`sum(case when ${flowEvents.eventType} = 'impression' then 1 else 0 end)`,
      saves: sql<string>`sum(case when ${flowEvents.eventType} = 'save' then 1 else 0 end)`,
      cancels: sql<string>`sum(case when ${flowEvents.eventType} = 'cancel' then 1 else 0 end)`,
    })
    .from(flowEvents)
    .where(eq(flowEvents.flowId, params.id));

  const impressions = Number(counts?.impressions ?? 0);
  const saves = Number(counts?.saves ?? 0);
  const cancels = Number(counts?.cancels ?? 0);
  const saveRate =
    saves + cancels > 0
      ? Math.round((saves / (saves + cancels)) * 100)
      : 0;

  // Per-step: join flow_steps with flow_events
  const allSteps = await db
    .select()
    .from(flowSteps)
    .where(eq(flowSteps.flowId, params.id))
    .orderBy(flowSteps.order);

  const stepIds = allSteps.map((s) => s.id);

  // Get step-level event counts (only if there are steps)
  const stepEventCounts = stepIds.length > 0
    ? await db
        .select({
          stepId: flowEvents.stepId,
          views: sql<string>`sum(case when ${flowEvents.eventType} = 'step_view' then 1 else 0 end)`,
          answers: sql<string>`sum(case when ${flowEvents.eventType} = 'answer' then 1 else 0 end)`,
        })
        .from(flowEvents)
        .where(
          and(
            eq(flowEvents.flowId, params.id),
            inArray(flowEvents.stepId, stepIds)
          )
        )
        .groupBy(flowEvents.stepId)
    : [];

  const stepCountsMap = new Map(
    stepEventCounts.map((r) => [
      r.stepId,
      { views: Number(r.views), answers: Number(r.answers) },
    ])
  );

  return NextResponse.json({
    impressions,
    saves,
    cancels,
    saveRate,
    steps: allSteps.map((s) => {
      const sc = stepCountsMap.get(s.id) ?? { views: 0, answers: 0 };
      return {
        stepId: s.id,
        order: s.order,
        type: s.type,
        title: s.title,
        views: sc.views,
        answers: sc.answers,
      };
    }),
  });
}
