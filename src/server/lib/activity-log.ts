import { headers } from "next/headers";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import type { Prisma } from "@prisma/client";

async function getRequestInfo(): Promise<{
  ipAddress: string | null;
  userAgent: string | null;
}> {
  try {
    const hdrs = await headers();
    const ipAddress =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? hdrs.get("x-real-ip") ?? null;
    const userAgent = hdrs.get("user-agent") ?? null;
    return { ipAddress, userAgent };
  } catch {
    return { ipAddress: null, userAgent: null };
  }
}

/**
 * Fire-and-forget activity tracking. Never throws — failures are logged silently.
 * Use this to record user actions for the admin audit panel.
 */
export function trackActivity(params: {
  userId: string;
  action: string;
  entity?: string;
  entityId?: string;
  meta?: Record<string, unknown>;
}): void {
  getRequestInfo()
    .then(({ ipAddress, userAgent }) =>
      db.activityLog.create({
        data: {
          userId: params.userId,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          meta: (params.meta as Prisma.InputJsonValue) ?? undefined,
          ipAddress,
          userAgent,
        },
      }),
    )
    .catch((err) => {
      logger.error("activity_log_write_failed", {
        action: params.action,
        error: err instanceof Error ? err.message : "unknown",
      });
    });
}
