"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { runAnalysis } from "@/server/actions/analysis";
import { ANALYSIS_MODES, DEFAULT_MODE, type AnalysisMode } from "@/lib/ai/modes";
import { useTrack } from "@/lib/use-track";
import type { MatterStatus } from "@prisma/client";

const STATUS_BADGE_VARIANT: Record<MatterStatus, "draft" | "active" | "archived"> = {
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
};

interface MatterWorkspaceShellProps {
  matterId: string;
  title: string;
  status: MatterStatus;
  intakeReady?: boolean;
  children: React.ReactNode;
}

const TABS = [
  { key: "intake", label: "Intake", segment: "intake" },
  { key: "analysis", label: "Analysis", segment: "analysis" },
  { key: "documents", label: "Documents", segment: "documents" },
] as const;

export function MatterWorkspaceShell({
  matterId,
  title,
  status,
  intakeReady = false,
  children,
}: MatterWorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const basePath = `/matters/${matterId}`;

  const track = useTrack();
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState("");
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>(DEFAULT_MODE);

  const activeTab = TABS.find((t) => pathname.endsWith(`/${t.segment}`))?.key ?? "intake";

  // Clear error when navigating between tabs
  useEffect(() => {
    setRunError("");
  }, [pathname]);

  async function handleRunAnalysis() {
    track({
      action: "ui.run_analysis_click",
      entity: "matter",
      entityId: matterId,
      meta: { mode: selectedMode },
    });
    setRunError("");
    setRunning(true);

    try {
      const result = await runAnalysis(matterId, selectedMode);

      if ("error" in result) {
        setRunError(result.error);
        return;
      }

      router.push(`${basePath}/analysis`);
      router.refresh();
    } catch {
      setRunError("Analysis request failed. Please try again.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-zinc-800/60 px-6 pt-4 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-zinc-500 hover:text-zinc-300"
              aria-label="Back to dashboard"
            >
              &larr;
            </Link>
            <h1 className="text-base font-semibold text-zinc-100">{title}</h1>
            <Badge variant={STATUS_BADGE_VARIANT[status]}>{status}</Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode selector */}
            <select
              value={selectedMode}
              onChange={(e) => {
                const mode = e.target.value as AnalysisMode;
                setSelectedMode(mode);
                track({
                  action: "ui.mode_change",
                  entity: "matter",
                  entityId: matterId,
                  meta: { mode },
                });
              }}
              disabled={running}
              className="rounded-md border border-zinc-700 bg-zinc-800/60 px-2 py-1.5 text-xs text-zinc-300 focus:border-indigo-500 focus:outline-none"
            >
              {Object.values(ANALYSIS_MODES).map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>

            {/* Run Analysis */}
            <Button
              size="sm"
              disabled={!intakeReady || running}
              onClick={handleRunAnalysis}
              title={
                intakeReady ? "Generate legal analysis" : "Complete required intake sections first"
              }
            >
              {running ? "Analyzing…" : "Run Analysis"}
            </Button>

            {/* Print/export is available via the Print button in the analysis viewer sidebar */}
          </div>
        </div>

        {/* Error display */}
        {runError && <p className="mt-2 text-xs text-red-400">{runError}</p>}

        {/* Tab bar */}
        <nav className="mt-3 flex gap-4">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={`${basePath}/${tab.segment}`}
              onClick={() =>
                track({
                  action: "ui.tab_click",
                  entity: "matter",
                  entityId: matterId,
                  meta: { tab: tab.key },
                })
              }
              className={cn(
                "border-b-2 pb-2 text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "border-indigo-500 text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-300",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
