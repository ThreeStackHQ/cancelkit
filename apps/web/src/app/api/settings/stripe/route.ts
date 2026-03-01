import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, workspaceSettings, eq } from "@cancelkit/db";
import { encrypt, decrypt, maskStripeKey } from "@/lib/crypto";
import { z } from "zod";

const saveStripeKeySchema = z.object({
  stripeSecretKey: z
    .string()
    .min(20)
    .regex(/^sk_(live|test)_/, "Must be a valid Stripe secret key"),
});

/**
 * GET /api/settings/stripe
 * Returns the masked Stripe key for the authenticated user's workspace.
 */
export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [settings] = await db
    .select()
    .from(workspaceSettings)
    .where(eq(workspaceSettings.userId, session.user.id))
    .limit(1);

  if (!settings?.stripeSecretKeyEncrypted) {
    return NextResponse.json({ stripeKey: null });
  }

  const plaintext = decrypt(settings.stripeSecretKeyEncrypted);
  return NextResponse.json({ stripeKey: maskStripeKey(plaintext) });
}

/**
 * POST /api/settings/stripe
 * Save (or replace) the encrypted Stripe secret key for the workspace.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await req.json();
  const parsed = saveStripeKeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const encrypted = encrypt(parsed.data.stripeSecretKey);

  // Upsert workspace settings
  const [existing] = await db
    .select({ id: workspaceSettings.id })
    .from(workspaceSettings)
    .where(eq(workspaceSettings.userId, session.user.id))
    .limit(1);

  if (existing) {
    await db
      .update(workspaceSettings)
      .set({
        stripeSecretKeyEncrypted: encrypted,
        updatedAt: new Date(),
      })
      .where(eq(workspaceSettings.userId, session.user.id));
  } else {
    await db.insert(workspaceSettings).values({
      userId: session.user.id,
      stripeSecretKeyEncrypted: encrypted,
    });
  }

  return NextResponse.json(
    { message: "Stripe key saved", stripeKey: maskStripeKey(parsed.data.stripeSecretKey) },
    { status: 200 }
  );
}
