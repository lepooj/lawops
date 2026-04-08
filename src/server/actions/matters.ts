"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/server/auth-guard";
import { revalidatePath } from "next/cache";
import type { MatterStatus, MatterType } from "@prisma/client";
import { trackActivity } from "@/server/lib/activity-log";

// === Schemas ===

const createMatterSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  matterType: z.enum(["LITIGATION", "REGULATORY", "ADVISORY", "OTHER"]),
});

// === Actions ===

export async function createMatter(input: {
  title: string;
  matterType: MatterType;
}): Promise<{ id: string } | { error: string }> {
  const user = await requireUser();
  const parsed = createMatterSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const matter = await db.matter.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      matterType: parsed.data.matterType,
      status: "DRAFT",
      intake: {
        create: {},
      },
    },
  });

  trackActivity({
    userId: user.id,
    action: "matter.create",
    entity: "matter",
    entityId: matter.id,
    meta: { title: parsed.data.title, type: parsed.data.matterType },
  });

  revalidatePath("/dashboard");
  return { id: matter.id };
}

export async function listMatters(filter?: MatterStatus | "ALL") {
  const user = await requireUser();

  const where: { userId: string; status?: MatterStatus } = {
    userId: user.id,
  };

  if (filter && filter !== "ALL") {
    where.status = filter;
  }

  return db.matter.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      matterType: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      intake: {
        select: {
          province: true,
          areaOfLaw: true,
        },
      },
    },
  });
}

export async function getMatter(matterId: string) {
  const user = await requireUser();

  const matter = await db.matter.findFirst({
    where: {
      id: matterId,
      userId: user.id,
    },
    include: {
      intake: true,
      _count: {
        select: {
          documents: true,
          analysisRuns: true,
        },
      },
    },
  });

  if (!matter) return null;
  return matter;
}

export async function archiveMatter(
  matterId: string,
): Promise<{ success: true } | { error: string }> {
  const user = await requireUser();

  const matter = await db.matter.findFirst({
    where: { id: matterId, userId: user.id },
    select: { id: true, status: true },
  });

  if (!matter) {
    return { error: "Matter not found" };
  }

  if (matter.status === "ARCHIVED") {
    return { error: "Matter is already archived" };
  }

  await db.matter.update({
    where: { id: matterId },
    data: {
      status: "ARCHIVED",
      archivedAt: new Date(),
    },
  });

  trackActivity({
    userId: user.id,
    action: "matter.archive",
    entity: "matter",
    entityId: matterId,
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function restoreMatter(
  matterId: string,
): Promise<{ success: true } | { error: string }> {
  const user = await requireUser();

  const matter = await db.matter.findFirst({
    where: { id: matterId, userId: user.id },
    select: { id: true, status: true },
  });

  if (!matter) {
    return { error: "Matter not found" };
  }

  if (matter.status !== "ARCHIVED") {
    return { error: "Matter is not archived" };
  }

  await db.matter.update({
    where: { id: matterId },
    data: {
      status: "ACTIVE",
      archivedAt: null,
    },
  });

  trackActivity({
    userId: user.id,
    action: "matter.restore",
    entity: "matter",
    entityId: matterId,
  });

  revalidatePath("/dashboard");
  return { success: true };
}
