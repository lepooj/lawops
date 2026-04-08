"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/server/auth-guard";
import { revalidatePath } from "next/cache";
import { trackActivity } from "@/server/lib/activity-log";

// === Schemas ===

const partySchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
});

const keyDateSchema = z.object({
  date: z.string().min(1),
  event: z.string().min(1),
});

const authoritySchema = z.object({
  caseName: z.string().min(1),
  citation: z.string().min(1),
  relevance: z.string(),
});

const intakeSaveSchema = z.object({
  matterId: z.string().uuid(),
  section: z.enum(["jurisdiction", "facts", "objective", "history", "authorities"]),
  data: z.record(z.unknown()),
});

const jurisdictionDataSchema = z.object({
  province: z.string().optional().nullable(),
  courtLevel: z.string().optional().nullable(),
  jurisdictionType: z.string().optional().nullable(),
  areaOfLaw: z.string().optional().nullable(),
});

const factsDataSchema = z.object({
  facts: z.string().max(10000).optional().nullable(),
  parties: z.array(partySchema).optional().nullable(),
});

const objectiveDataSchema = z.object({
  desiredOutcome: z.string().max(5000).optional().nullable(),
  constraints: z.string().max(5000).optional().nullable(),
});

const historyDataSchema = z.object({
  proceduralStage: z.string().optional().nullable(),
  priorDecisions: z.string().max(5000).optional().nullable(),
  keyDates: z.array(keyDateSchema).optional().nullable(),
});

const authoritiesDataSchema = z.object({
  supportingAuthorities: z.array(authoritySchema).optional().nullable(),
  opposingArguments: z.string().max(5000).optional().nullable(),
  opposingAuthorities: z.array(authoritySchema).optional().nullable(),
});

// === Actions ===

export async function getIntake(matterId: string) {
  const user = await requireUser();

  const matter = await db.matter.findFirst({
    where: { id: matterId, userId: user.id },
    select: { id: true },
  });

  if (!matter) return null;

  return db.matterIntake.findUnique({
    where: { matterId },
  });
}

export async function saveIntakeSection(input: {
  matterId: string;
  section: string;
  data: Record<string, unknown>;
}): Promise<{ success: true; updatedAt: string } | { error: string }> {
  const user = await requireUser();

  const parsed = intakeSaveSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Verify ownership
  const matter = await db.matter.findFirst({
    where: { id: parsed.data.matterId, userId: user.id },
    select: { id: true },
  });

  if (!matter) {
    return { error: "Matter not found" };
  }

  // Parse section-specific data
  let updateData: Record<string, unknown>;

  switch (parsed.data.section) {
    case "jurisdiction": {
      const sectionParsed = jurisdictionDataSchema.safeParse(parsed.data.data);
      if (!sectionParsed.success) return { error: sectionParsed.error.issues[0].message };
      updateData = sectionParsed.data;
      break;
    }
    case "facts": {
      const sectionParsed = factsDataSchema.safeParse(parsed.data.data);
      if (!sectionParsed.success) return { error: sectionParsed.error.issues[0].message };
      updateData = {
        facts: sectionParsed.data.facts,
        parties: sectionParsed.data.parties ?? undefined,
      };
      break;
    }
    case "objective": {
      const sectionParsed = objectiveDataSchema.safeParse(parsed.data.data);
      if (!sectionParsed.success) return { error: sectionParsed.error.issues[0].message };
      updateData = sectionParsed.data;
      break;
    }
    case "history": {
      const sectionParsed = historyDataSchema.safeParse(parsed.data.data);
      if (!sectionParsed.success) return { error: sectionParsed.error.issues[0].message };
      updateData = {
        proceduralStage: sectionParsed.data.proceduralStage,
        priorDecisions: sectionParsed.data.priorDecisions,
        keyDates: sectionParsed.data.keyDates ?? undefined,
      };
      break;
    }
    case "authorities": {
      const sectionParsed = authoritiesDataSchema.safeParse(parsed.data.data);
      if (!sectionParsed.success) return { error: sectionParsed.error.issues[0].message };
      updateData = {
        supportingAuthorities: sectionParsed.data.supportingAuthorities ?? undefined,
        opposingArguments: sectionParsed.data.opposingArguments,
        opposingAuthorities: sectionParsed.data.opposingAuthorities ?? undefined,
      };
      break;
    }
    default:
      return { error: "Unknown section" };
  }

  const updated = await db.matterIntake.update({
    where: { matterId: parsed.data.matterId },
    data: updateData,
    select: { updatedAt: true },
  });

  trackActivity({
    userId: user.id,
    action: "intake.save",
    entity: "matter",
    entityId: parsed.data.matterId,
    meta: { section: parsed.data.section },
  });

  revalidatePath(`/matters/${parsed.data.matterId}`);
  return { success: true, updatedAt: updated.updatedAt.toISOString() };
}
