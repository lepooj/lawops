import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import type { Prisma } from "@prisma/client";

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
  db.activityLog
    .create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        meta: (params.meta as Prisma.InputJsonValue) ?? undefined,
      },
    })
    .catch((err) => {
      logger.error("activity_log_write_failed", {
        action: params.action,
        error: err instanceof Error ? err.message : "unknown",
      });
    });
}
