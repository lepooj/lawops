"use client";

import { Badge } from "@/components/ui/badge";
import { AnalysisViewer } from "@/components/analysis/analysis-viewer";
import {
  safeParseModelJson,
  validateCopilotOutput,
} from "@/lib/ai/output-validator";
import type { AnalysisStatus } from "@prisma/client";

interface LatestRun {
  id: string;
  runNumber: number;
  status: AnalysisStatus;
  rawOutput: string | null;
  model: string;
  promptVersion: string;
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs: number | null;
  errorMessage: string | null;
  startedAt: Date;
  completedAt: Date | null;
}

interface Props {
  matterId: string;
  latestRun: LatestRun | null;
}

export function AnalysisPageClient({ latestRun }: Props) {
  // No analysis yet
  if (!latestRun) {
    return (
      <CenterCard>
        <h2 className="text-base font-semibold text-zinc-200">
          No Analysis Yet
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
          Complete the required intake sections (Jurisdiction, Facts, and Legal
          Objective), then click <strong className="text-zinc-400">Run Analysis</strong> to
          generate a structured legal analysis.
        </p>
        <div className="mt-5 space-y-2 text-left text-xs text-zinc-600">
          <p>The analysis will include:</p>
          <ul className="ml-3 list-disc space-y-1 text-zinc-500">
            <li>Issues to decide</li>
            <li>Governing law with verification status</li>
            <li>Cited authorities with confidence labels</li>
            <li>Application, counterarguments, and risk assessment</li>
            <li>Recommended next steps</li>
          </ul>
        </div>
      </CenterCard>
    );
  }

  // Running
  if (latestRun.status === "RUNNING") {
    return (
      <CenterCard>
        <div className="flex items-center justify-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
          <h2 className="text-sm font-medium text-zinc-300">
            Generating Analysis
          </h2>
        </div>
        <p className="mt-2 max-w-sm text-sm text-zinc-500">
          Analyzing your matter. This typically takes 30&ndash;90 seconds.
          Refresh the page to check for results.
        </p>
        <div className="mt-4 flex justify-center">
          <Badge variant="draft">Run #{latestRun.runNumber}</Badge>
        </div>
      </CenterCard>
    );
  }

  // Failed
  if (latestRun.status === "FAILED") {
    return (
      <CenterCard variant="error">
        <h2 className="text-sm font-semibold text-red-300">
          Analysis Failed
        </h2>
        <p className="mt-2 max-w-md text-sm text-red-400/80">
          {simplifyError(latestRun.errorMessage)}
        </p>
        <p className="mt-4 text-xs text-zinc-500">
          Run #{latestRun.runNumber} &middot; Use <strong className="text-zinc-400">Run Analysis</strong> above to try again.
        </p>
      </CenterCard>
    );
  }

  // Complete — parse and validate
  if (!latestRun.rawOutput) {
    return (
      <CenterCard variant="warning">
        <p className="text-sm text-amber-400">
          Analysis completed but no output was stored. Run a new analysis.
        </p>
      </CenterCard>
    );
  }

  const parseResult = safeParseModelJson(latestRun.rawOutput);
  if (!parseResult.ok) {
    return (
      <CenterCard variant="error">
        <p className="text-sm text-red-400">
          The stored analysis could not be read. Run a new analysis to generate
          fresh results.
        </p>
      </CenterCard>
    );
  }

  const validationResult = validateCopilotOutput(parseResult.data);
  if (!validationResult.ok) {
    return (
      <CenterCard variant="error">
        <p className="text-sm text-red-400">
          The stored analysis did not pass validation. Run a new analysis.
        </p>
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-zinc-600 hover:text-zinc-400">
            Technical details
          </summary>
          <div className="mt-1 space-y-1 text-xs text-zinc-600">
            {validationResult.errors.slice(0, 3).map((e, i) => (
              <p key={i}>
                {e.code}: {e.message}
              </p>
            ))}
          </div>
        </details>
      </CenterCard>
    );
  }

  return (
    <AnalysisViewer
      output={validationResult.data}
      stats={validationResult.stats}
      warnings={validationResult.warnings}
      runMeta={{
        runNumber: latestRun.runNumber,
        model: latestRun.model,
        latencyMs: latestRun.latencyMs,
        completedAt: latestRun.completedAt?.toISOString() ?? null,
      }}
    />
  );
}

// === Helpers ===

function CenterCard({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "error" | "warning";
}) {
  const borderColor = {
    default: "border-zinc-800/60",
    error: "border-red-900/40",
    warning: "border-amber-900/40",
  }[variant];

  const bgColor = {
    default: "bg-zinc-900/40",
    error: "bg-red-950/20",
    warning: "bg-amber-950/20",
  }[variant];

  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className={`max-w-lg rounded-lg border ${borderColor} ${bgColor} px-8 py-10`}>
        {children}
      </div>
    </div>
  );
}

/** Simplify technical error messages for user display. */
function simplifyError(message: string | null): string {
  if (!message) return "An unexpected error occurred during analysis.";

  // Common patterns → friendlier messages
  if (message.includes("OPENAI_API_KEY"))
    return "The AI service is not configured. Contact the administrator.";
  if (message.includes("timeout") || message.includes("Timeout"))
    return "The analysis took too long and timed out. Try again — this is usually temporary.";
  if (message.includes("rate limit") || message.includes("429"))
    return "The AI service is temporarily busy. Wait a minute and try again.";
  if (message.includes("Validation failed"))
    return "The AI produced output that did not pass safety validation. Try again with a different mode or more detailed intake.";
  if (message.includes("JSON parse"))
    return "The AI response was malformed. This is usually temporary — try again.";

  // Don't expose raw error details by default
  if (message.length > 200)
    return "Analysis failed. Try again, or contact support if this persists.";

  return message;
}
