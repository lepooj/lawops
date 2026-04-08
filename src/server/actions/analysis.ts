"use server";

import { db } from "@/lib/db";
import { requireUser } from "@/server/auth-guard";
import { revalidatePath } from "next/cache";
import { buildAnalysisInput } from "@/server/lib/analysis/build-analysis-input";
import { callLegalCopilot } from "@/server/lib/analysis/openai-client";
import { safeParseModelJson, validateCopilotOutput } from "@/lib/ai/output-validator";
import type { AnalysisMode } from "@/lib/ai/modes";
import { trackActivity } from "@/server/lib/activity-log";

export async function runAnalysis(
  matterId: string,
  mode: AnalysisMode,
): Promise<{ runId: string } | { error: string }> {
  const user = await requireUser();

  // Verify ownership and get matter data
  const matter = await db.matter.findFirst({
    where: { id: matterId, userId: user.id },
    include: {
      intake: true,
      documents: {
        select: {
          id: true,
          originalFilename: true,
          documentType: true,
          extractionMethod: true,
          extractionStatus: true,
          extractedText: true,
          includeInAnalysis: true,
        },
      },
    },
  });

  if (!matter) {
    return { error: "Matter not found" };
  }

  if (!matter.intake) {
    return { error: "No intake data found for this matter." };
  }

  // Check for already-running analysis
  const running = await db.analysisRun.findFirst({
    where: { matterId, status: "RUNNING" },
    select: { id: true },
  });

  if (running) {
    return { error: "An analysis is already running for this matter." };
  }

  // Build the analysis input
  const inputResult = buildAnalysisInput({
    mode,
    matterId,
    matterTitle: matter.title,
    intake: matter.intake,
    documents: matter.documents,
    userName: user.name,
  });

  if (!inputResult.ok) {
    return { error: inputResult.error };
  }

  // Determine run number
  const lastRun = await db.analysisRun.findFirst({
    where: { matterId },
    orderBy: { runNumber: "desc" },
    select: { runNumber: true },
  });
  const runNumber = (lastRun?.runNumber ?? 0) + 1;

  // Create the run record
  const run = await db.analysisRun.create({
    data: {
      matterId,
      userId: user.id,
      runNumber,
      status: "RUNNING",
      inputSnapshot: inputResult.inputSnapshot as object,
      documentExcerpts: inputResult.documentExcerpts as unknown as object,
      promptVersion: "v1",
      model: process.env.OPENAI_MODEL ?? "gpt-4.1",
    },
  });

  trackActivity({
    userId: user.id,
    action: "analysis.start",
    entity: "analysis",
    entityId: run.id,
    meta: { matterId, runNumber, mode },
  });

  try {
    // Call the model
    const callResult = await callLegalCopilot(inputResult.payload, mode);

    if (!callResult.ok) {
      await db.analysisRun.update({
        where: { id: run.id },
        data: {
          status: "FAILED",
          model: callResult.model,
          latencyMs: callResult.latencyMs,
          errorMessage: callResult.error,
          completedAt: new Date(),
        },
      });

      revalidatePath(`/matters/${matterId}`);
      return { error: `Analysis failed: ${callResult.error}` };
    }

    // Parse JSON from model response
    const parseResult = safeParseModelJson(callResult.content);

    if (!parseResult.ok) {
      await db.analysisRun.update({
        where: { id: run.id },
        data: {
          status: "FAILED",
          model: callResult.model,
          rawOutput: callResult.content,
          inputTokens: callResult.inputTokens,
          outputTokens: callResult.outputTokens,
          latencyMs: callResult.latencyMs,
          errorMessage: `JSON parse error: ${parseResult.error}`,
          completedAt: new Date(),
        },
      });

      revalidatePath(`/matters/${matterId}`);
      return { error: "Model returned invalid JSON." };
    }

    // Validate against the copilot output schema
    const validationResult = validateCopilotOutput(parseResult.data);

    if (!validationResult.ok) {
      const errorSummary = validationResult.errors
        .slice(0, 3)
        .map((e) => `${e.code}: ${e.message}`)
        .join("; ");

      await db.analysisRun.update({
        where: { id: run.id },
        data: {
          status: "FAILED",
          model: callResult.model,
          rawOutput: callResult.content,
          inputTokens: callResult.inputTokens,
          outputTokens: callResult.outputTokens,
          latencyMs: callResult.latencyMs,
          errorMessage: `Validation failed: ${errorSummary}`,
          completedAt: new Date(),
        },
      });

      revalidatePath(`/matters/${matterId}`);
      return { error: "Model output failed validation." };
    }

    // Store the validated output as raw JSON
    await db.analysisRun.update({
      where: { id: run.id },
      data: {
        status: "COMPLETE",
        model: callResult.model,
        rawOutput: callResult.content,
        inputTokens: callResult.inputTokens,
        outputTokens: callResult.outputTokens,
        latencyMs: callResult.latencyMs,
        completedAt: new Date(),
      },
    });

    // Activate the matter if still in DRAFT
    if (matter.status === "DRAFT") {
      await db.matter.update({
        where: { id: matterId },
        data: { status: "ACTIVE" },
      });
    }

    trackActivity({
      userId: user.id,
      action: "analysis.complete",
      entity: "analysis",
      entityId: run.id,
      meta: {
        matterId,
        runNumber,
        model: callResult.model,
        inputTokens: callResult.inputTokens,
        outputTokens: callResult.outputTokens,
        latencyMs: callResult.latencyMs,
      },
    });

    revalidatePath(`/matters/${matterId}`);
    return { runId: run.id };
  } catch (e) {
    // Unexpected error — mark run as failed
    await db.analysisRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        errorMessage: e instanceof Error ? e.message : "Unexpected error during analysis",
        completedAt: new Date(),
      },
    });

    revalidatePath(`/matters/${matterId}`);
    return {
      error: e instanceof Error ? e.message : "Analysis failed unexpectedly.",
    };
  }
}

export async function getLatestAnalysis(matterId: string) {
  const user = await requireUser();

  const matter = await db.matter.findFirst({
    where: { id: matterId, userId: user.id },
    select: { id: true },
  });

  if (!matter) return null;

  return db.analysisRun.findFirst({
    where: { matterId },
    orderBy: { runNumber: "desc" },
    select: {
      id: true,
      runNumber: true,
      status: true,
      rawOutput: true,
      model: true,
      promptVersion: true,
      inputTokens: true,
      outputTokens: true,
      latencyMs: true,
      errorMessage: true,
      startedAt: true,
      completedAt: true,
    },
  });
}
