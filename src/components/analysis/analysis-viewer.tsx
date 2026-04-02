"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  CopilotOutput,
  Authority,
  Issue,
  GoverningLawEntry,
} from "@/lib/ai/output-schema";
import type { OutputStats, ValidationWarning } from "@/lib/ai/output-validator";

interface AnalysisViewerProps {
  output: CopilotOutput;
  stats: OutputStats;
  warnings: ValidationWarning[];
  runMeta: {
    runNumber: number;
    model: string;
    latencyMs: number | null;
    completedAt: string | null;
    hasOcrDocuments?: boolean;
  };
}

export function AnalysisViewer({
  output,
  stats,
  warnings,
  runMeta,
}: AnalysisViewerProps) {
  return (
    <div className="flex h-full">
      {/* Left TOC — hidden in print */}
      <aside className="w-52 shrink-0 border-r border-zinc-800/60 p-4 print:hidden">
        <nav className="space-y-1 text-xs">
          {SECTION_ORDER.map((s) => (
            <a
              key={s.key}
              href={`#section-${s.key}`}
              className="block rounded px-2 py-1.5 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
            >
              {s.label}
            </a>
          ))}
        </nav>

        {/* Verification summary */}
        <div className="mt-6 space-y-2 border-t border-zinc-800/60 pt-4 text-[11px]">
          <p className="font-medium text-zinc-400">Authorities</p>
          <div className="space-y-1">
            {stats.verifiedAuthorities > 0 && (
              <p className="text-emerald-400">
                {stats.verifiedAuthorities} verified
              </p>
            )}
            {stats.provisionalAuthorities > 0 && (
              <p className="text-amber-400">
                {stats.provisionalAuthorities} provisional
              </p>
            )}
            {stats.unverifiedAuthorities > 0 && (
              <p className="text-red-400">
                {stats.unverifiedAuthorities} unverified
              </p>
            )}
            {stats.totalAuthorities === 0 && (
              <p className="text-zinc-600">None cited</p>
            )}
          </div>

          <div className="mt-3 space-y-1">
            <p className="text-zinc-500">
              {stats.totalIssues} issue{stats.totalIssues !== 1 ? "s" : ""}
            </p>
            {stats.totalResearchGaps > 0 && (
              <p className="text-zinc-500">
                {stats.totalResearchGaps} research gap{stats.totalResearchGaps !== 1 ? "s" : ""}
              </p>
            )}
            {stats.totalMissingFacts > 0 && (
              <p className="text-zinc-500">
                {stats.totalMissingFacts} missing fact{stats.totalMissingFacts !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {/* Export buttons */}
        <div className="mt-6 space-y-2">
          <Button
            size="sm"
            variant="primary"
            className="w-full"
            onClick={async () => {
              const { generateAnalysisPdf } = await import("./analysis-pdf");
              const blob = await generateAnalysisPdf(
                output,
                stats,
                runMeta.completedAt
              );
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `analysis-${output.mode}-${new Date().toISOString().slice(0, 10)}.pdf`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export PDF
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="w-full"
            onClick={() => window.print()}
          >
            Print
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto px-8 py-6 print:px-0 print:py-0">
        {/* Print header — visible only in print */}
        <div className="mb-8 hidden print:block">
          <h1 className="text-lg font-bold text-black">
            Legal Analysis — {output.matter_summary.task}
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            {output.matter_summary.jurisdiction} · {output.matter_summary.forum} · {output.mode} mode
          </p>
          {runMeta.completedAt && (
            <p className="text-xs text-gray-500">
              Generated {runMeta.completedAt}
            </p>
          )}
          <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-gray-400">
            AI-Assisted Draft — Verify Before Reliance
          </p>
        </div>

        {/* Run metadata bar — screen only */}
        <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-zinc-500 print:hidden">
          <span>Run #{runMeta.runNumber}</span>
          <span className="font-mono">{runMeta.model}</span>
          {runMeta.latencyMs != null && (
            <span>{(runMeta.latencyMs / 1000).toFixed(1)}s</span>
          )}
          {runMeta.completedAt && (
            <span>{runMeta.completedAt}</span>
          )}
          <Badge variant="active">{output.mode}</Badge>
          <ConfidenceBadge level={output.confidence.overall} />
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mb-4 rounded border border-amber-900/40 bg-amber-950/20 px-3 py-2 print:border-amber-300 print:bg-amber-50">
            {warnings.map((w, i) => (
              <p key={i} className="text-xs text-amber-400 print:text-amber-700">
                {w.message}
              </p>
            ))}
          </div>
        )}

        {/* OCR notice */}
        {runMeta.hasOcrDocuments && (
          <div className="mb-4 rounded border border-amber-900/40 bg-amber-950/20 px-3 py-2 print:border-amber-300 print:bg-amber-50">
            <p className="text-xs text-amber-400 print:text-amber-700">
              This analysis includes OCR-extracted documents which may contain text errors.
              Verify source document accuracy before reliance.
            </p>
          </div>
        )}

        {/* Matter Summary */}
        <AnalysisSection id="matter-summary" title="Matter Summary">
          <p className="text-sm text-zinc-300 print:text-gray-800">{output.matter_summary.summary}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <MetaTag label="Jurisdiction" value={output.matter_summary.jurisdiction} />
            <MetaTag label="Forum" value={output.matter_summary.forum} />
            <MetaTag label="Posture" value={output.matter_summary.procedural_posture} />
            {output.matter_summary.area_of_law.map((a) => (
              <MetaTag key={a} label="Area" value={a} />
            ))}
          </div>
        </AnalysisSection>

        {/* Issues */}
        <AnalysisSection id="issues" title="Issues to Decide">
          {output.issues.length === 0 ? (
            <EmptyNote>No issues identified.</EmptyNote>
          ) : (
            <div className="space-y-2">
              {output.issues.map((issue) => (
                <IssueRow key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </AnalysisSection>

        {/* Governing Law */}
        <AnalysisSection id="governing-law" title="Governing Law">
          {output.governing_law.length === 0 ? (
            <EmptyNote>No governing law identified.</EmptyNote>
          ) : (
            <div className="space-y-3">
              {output.governing_law.map((gl, i) => (
                <GoverningLawRow key={i} entry={gl} />
              ))}
            </div>
          )}
        </AnalysisSection>

        {/* Authorities */}
        <AnalysisSection id="authorities" title="Authorities">
          {output.authorities.length === 0 ? (
            <EmptyNote>No authorities cited.</EmptyNote>
          ) : (
            <div className="space-y-3">
              {output.authorities.map((auth) => (
                <AuthorityCard key={auth.id} authority={auth} />
              ))}
            </div>
          )}
        </AnalysisSection>

        {/* Application */}
        <AnalysisSection id="application" title="Application to the Facts">
          <SubSection title="Core Analysis">
            <BulletList items={output.application.core_analysis} />
          </SubSection>
          <SubSection title="Strongest Arguments">
            <BulletList items={output.application.strongest_arguments} />
          </SubSection>
          <SubSection title="Weaknesses">
            <BulletList items={output.application.weaknesses} />
          </SubSection>
          <SubSection title="Fact Dependencies">
            <BulletList items={output.application.fact_dependencies} />
          </SubSection>
        </AnalysisSection>

        {/* Counterarguments */}
        <AnalysisSection id="counterarguments" title="Counterarguments">
          <BulletList items={output.counterarguments} />
        </AnalysisSection>

        {/* Procedural Considerations */}
        <AnalysisSection id="procedural" title="Procedural Considerations">
          <BulletList items={output.procedural_considerations} />
        </AnalysisSection>

        {/* Missing Facts */}
        {output.missing_facts.length > 0 && (
          <AnalysisSection id="missing-facts" title="Missing Facts">
            <BulletList items={output.missing_facts} />
          </AnalysisSection>
        )}

        {/* Research Gaps */}
        {output.research_gaps.length > 0 && (
          <AnalysisSection id="research-gaps" title="Research Gaps">
            <BulletList items={output.research_gaps} />
          </AnalysisSection>
        )}

        {/* Next Steps */}
        <AnalysisSection id="next-steps" title="Recommended Next Steps">
          <BulletList items={output.recommended_next_steps} />
        </AnalysisSection>

        {/* Confidence */}
        <AnalysisSection id="confidence" title="Confidence Assessment">
          <div className="flex items-center gap-2">
            <ConfidenceBadge level={output.confidence.overall} />
            <span className="text-sm text-zinc-300 print:text-gray-700">{output.confidence.reason}</span>
          </div>
          {output.confidence.depends_on.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-zinc-500">Depends on:</p>
              <BulletList items={output.confidence.depends_on} />
            </div>
          )}
          {output.confidence.rough_strength_assessment && (
            <p className="mt-2 text-xs text-zinc-400 print:text-gray-600">
              Strength assessment: {output.confidence.rough_strength_assessment}
            </p>
          )}
        </AnalysisSection>

        {/* Verification */}
        <AnalysisSection id="verification" title="Verification Status">
          <div className="rounded border border-zinc-800/60 bg-zinc-900/30 px-4 py-3 print:border-gray-300 print:bg-gray-50">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  output.verification.needs_human_legal_review
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                )} />
                <span className="text-zinc-300 print:text-gray-700">
                  {output.verification.needs_human_legal_review
                    ? "Human legal review required"
                    : "No mandatory review flags raised"}
                </span>
              </div>
              {output.verification.contains_unverified_points && (
                <p className="text-amber-400 print:text-amber-700">
                  {output.verification.unverified_point_count} unverified
                  point{output.verification.unverified_point_count !== 1 ? "s" : ""} —
                  verify before reliance
                </p>
              )}
              {output.verification.notes?.map((note, i) => (
                <p key={i} className="text-xs text-zinc-500 print:text-gray-500">
                  {note}
                </p>
              ))}
            </div>
          </div>
        </AnalysisSection>

        {/* Draft Output */}
        {output.draft_output && (
          <AnalysisSection id="draft-output" title={output.draft_output.title || "Draft Output"}>
            <div className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-zinc-300 print:text-gray-800">
              {output.draft_output.body}
            </div>
            {output.draft_output.sections?.map((s, i) => (
              <div key={i} className="mt-4">
                <h4 className="font-serif text-sm font-semibold text-zinc-200 print:text-gray-900">{s.heading}</h4>
                <p className="mt-1 whitespace-pre-wrap font-serif text-sm text-zinc-400 print:text-gray-700">{s.content}</p>
              </div>
            ))}
          </AnalysisSection>
        )}

        {/* Comparison Matrix */}
        {output.comparison_matrix && output.comparison_matrix.length > 0 && (
          <AnalysisSection id="comparison" title="Comparison Matrix">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-zinc-500 print:border-gray-300 print:text-gray-600">
                    <th className="pb-2 pr-3">Point</th>
                    <th className="pb-2 pr-3">Current Matter</th>
                    <th className="pb-2 pr-3">Authority</th>
                    <th className="pb-2">Effect</th>
                  </tr>
                </thead>
                <tbody>
                  {output.comparison_matrix.map((row, i) => (
                    <tr key={i} className="border-b border-zinc-800/40 print:border-gray-200">
                      <td className="py-2 pr-3 text-zinc-300 print:text-gray-800">{row.point}</td>
                      <td className="py-2 pr-3 text-zinc-400 print:text-gray-600">{row.current_matter}</td>
                      <td className="py-2 pr-3 text-zinc-400 print:text-gray-600">{row.authority}</td>
                      <td className="py-2"><EffectBadge effect={row.effect} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnalysisSection>
        )}

        {/* Disclaimer footer */}
        <div className="mt-8 border-t border-zinc-800/60 pt-4 print:border-gray-300">
          <p className="text-xs text-zinc-500 print:text-gray-500">
            {output.disclaimer}
          </p>
          <p className="mt-1 text-[10px] text-zinc-600 print:text-gray-400">
            AI-generated analysis. All authorities and legal propositions require independent verification before reliance.
          </p>
        </div>
      </div>
    </div>
  );
}

// === Section registry ===

const SECTION_ORDER = [
  { key: "matter-summary", label: "Matter Summary" },
  { key: "issues", label: "Issues" },
  { key: "governing-law", label: "Governing Law" },
  { key: "authorities", label: "Authorities" },
  { key: "application", label: "Application" },
  { key: "counterarguments", label: "Counterarguments" },
  { key: "procedural", label: "Procedural" },
  { key: "missing-facts", label: "Missing Facts" },
  { key: "research-gaps", label: "Research Gaps" },
  { key: "next-steps", label: "Next Steps" },
  { key: "confidence", label: "Confidence" },
  { key: "verification", label: "Verification" },
];

// === Sub-components ===

function AnalysisSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={`section-${id}`} className="mb-8 print:mb-6 print:break-inside-avoid">
      <h3 className="mb-3 text-sm font-semibold text-zinc-100 print:text-base print:font-bold print:text-gray-900">{title}</h3>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <h4 className="mb-1 text-xs font-medium text-zinc-400 print:text-gray-600">{title}</h4>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return <EmptyNote>None identified.</EmptyNote>;

  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-zinc-300 print:text-gray-700">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600 print:bg-gray-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-zinc-500 print:text-gray-400">{children}</p>;
}

function IssueRow({ issue }: { issue: Issue }) {
  return (
    <div className="flex items-start gap-3 rounded border border-zinc-800/40 px-3 py-2 print:border-gray-200">
      <div className="flex-1">
        <p className="text-sm text-zinc-200 print:text-gray-800">{issue.issue}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Badge variant={issue.importance === "high" ? "active" : issue.importance === "medium" ? "draft" : "default"}>
          {issue.importance}
        </Badge>
        <Badge variant="default">{issue.status.replace("_", " ")}</Badge>
      </div>
    </div>
  );
}

function GoverningLawRow({ entry }: { entry: GoverningLawEntry }) {
  return (
    <div className={cn(
      "rounded border px-3 py-2 print:border-gray-200",
      entry.verification_status === "verified"
        ? "border-emerald-900/30 bg-emerald-950/10"
        : entry.verification_status === "provisional"
          ? "border-amber-900/30 bg-amber-950/10"
          : "border-red-900/30 bg-red-950/10"
    )}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-zinc-300 print:text-gray-800">{entry.topic}</p>
        <VerificationBadge status={entry.verification_status} />
      </div>
      <p className="mt-1 text-sm text-zinc-400 print:text-gray-600">{entry.rule_statement}</p>
      <p className="mt-1 text-[11px] text-zinc-600 print:text-gray-400">{entry.source_type}</p>
    </div>
  );
}

function AuthorityCard({ authority }: { authority: Authority }) {
  return (
    <div className={cn(
      "rounded border px-4 py-3 print:border-gray-200",
      authority.verification_status === "verified"
        ? "border-emerald-900/30 bg-emerald-950/10"
        : authority.verification_status === "provisional"
          ? "border-amber-900/30 bg-amber-950/10"
          : "border-red-900/30 bg-red-950/10"
    )}>
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-200 print:text-gray-900">{authority.title}</p>
          <p className="font-mono text-xs text-zinc-400 print:text-gray-600">{authority.citation}</p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <VerificationBadge status={authority.verification_status} />
        </div>
      </div>

      {/* Metadata row */}
      <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
        {authority.court_or_source && (
          <MetaTag label="Court" value={authority.court_or_source} />
        )}
        {authority.year && <MetaTag label="Year" value={String(authority.year)} />}
        <MetaTag label="Weight" value={authority.weight} />
        <TreatmentTag treatment={authority.treatment} />
      </div>

      {/* Relevance */}
      <p className="mt-2 text-xs text-zinc-400 print:text-gray-600">{authority.relevance}</p>

      {/* Quoted text */}
      {authority.quoted_text && (
        <blockquote className="mt-2 border-l-2 border-zinc-700 pl-3 font-serif text-xs italic text-zinc-500 print:border-gray-300 print:text-gray-500">
          &ldquo;{authority.quoted_text}&rdquo;
          {authority.pinpoint && (
            <span className="ml-1 not-italic text-zinc-600">at {authority.pinpoint}</span>
          )}
        </blockquote>
      )}
    </div>
  );
}

function TreatmentTag({ treatment }: { treatment: string }) {
  const colors: Record<string, string> = {
    supports: "text-emerald-400 bg-emerald-950/40",
    distinguishes: "text-amber-400 bg-amber-950/40",
    cuts_against: "text-red-400 bg-red-950/40",
    background_only: "text-zinc-400 bg-zinc-800/40",
  };

  return (
    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", colors[treatment] ?? colors.background_only)}>
      {treatment.replace("_", " ")}
    </span>
  );
}

function VerificationBadge({ status }: { status: "verified" | "provisional" | "unverified" }) {
  const config = {
    verified: { bg: "bg-emerald-950/60 print:bg-emerald-100", text: "text-emerald-400 print:text-emerald-700", label: "verified" },
    provisional: { bg: "bg-amber-950/60 print:bg-amber-100", text: "text-amber-400 print:text-amber-700", label: "provisional" },
    unverified: { bg: "bg-red-950/60 print:bg-red-100", text: "text-red-400 print:text-red-700", label: "unverified" },
  };
  const c = config[status];

  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", c.bg, c.text)}>
      {c.label}
    </span>
  );
}

function ConfidenceBadge({ level }: { level: "high" | "moderate" | "low" }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", {
      "bg-emerald-950/60 text-emerald-400": level === "high",
      "bg-amber-950/60 text-amber-400": level === "moderate",
      "bg-red-950/60 text-red-400": level === "low",
    })}>
      {level}
    </span>
  );
}

function EffectBadge({ effect }: { effect: "helps" | "hurts" | "mixed" | "unclear" }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", {
      "bg-emerald-950/60 text-emerald-400": effect === "helps",
      "bg-red-950/60 text-red-400": effect === "hurts",
      "bg-amber-950/60 text-amber-400": effect === "mixed",
      "bg-zinc-800 text-zinc-500": effect === "unclear",
    })}>
      {effect}
    </span>
  );
}

function MetaTag({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded bg-zinc-800/60 px-2 py-0.5 text-[11px] text-zinc-400 print:bg-gray-100 print:text-gray-600">
      <span className="text-zinc-600 print:text-gray-400">{label}:</span> {value}
    </span>
  );
}
