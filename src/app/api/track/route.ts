import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import type { Prisma } from "@prisma/client";

/**
 * Lightweight tracking endpoint for client-side events.
 * Accepts a batch of events in a single request.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: true }); // silent drop if unauthed
  }

  try {
    const body = await request.json();
    const events: {
      action: string;
      entity?: string;
      entityId?: string;
      meta?: Record<string, unknown>;
    }[] = Array.isArray(body) ? body : [body];

    // Cap at 20 events per request
    const batch = events.slice(0, 20);

    await db.activityLog.createMany({
      data: batch.map((e) => ({
        userId: session.user!.id,
        action: e.action,
        entity: e.entity ?? null,
        entityId: e.entityId ?? null,
        meta: (e.meta as Prisma.InputJsonValue) ?? undefined,
      })),
    });
  } catch (err) {
    logger.error("track_endpoint_failed", {
      error: err instanceof Error ? err.message : "unknown",
    });
  }

  return NextResponse.json({ ok: true });
}
