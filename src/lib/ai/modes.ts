/**
 * Analysis modes for the Canadian Legal CoPilot.
 *
 * Each mode changes what the model prioritizes in its output.
 * Source of truth: docs/AI-LEGAL-COPILOT-MODES.md
 */

export const ANALYSIS_MODES = {
  memo: {
    key: "memo" as const,
    label: "Legal Memo",
    description: "Balanced legal memo for internal legal review",
    priorities: [
      "Issue identification",
      "Governing law",
      "Application to facts",
      "Counterarguments",
      "Research gaps",
      "Procedural risks",
    ],
    instruction:
      "Prioritize balanced legal analysis suitable for internal review. " +
      "Do not advocate one side too aggressively unless explicitly asked. " +
      "Emphasize issue framing, governing law, application to facts, weaknesses, and research gaps. " +
      "Where uncertainty exists, surface it clearly rather than smoothing it over.",
    expectsDraftOutput: false,
    expectsComparisonMatrix: false,
  },

  strategy: {
    key: "strategy" as const,
    label: "Litigation Strategy",
    description: "Litigation or advocacy planning",
    priorities: [
      "Strongest arguments",
      "Expected attacks",
      "Procedural leverage points",
      "Evidentiary needs",
      "Record-building",
      "Sequencing",
    ],
    instruction:
      "Prioritize strategic usefulness. " +
      "Identify strongest available arguments, likely counterarguments, procedural choke points, " +
      "evidentiary vulnerabilities, and leverage opportunities. " +
      "You may assess relative argument strength qualitatively, but remain cautious and source-disciplined. " +
      "Do not promise outcomes and do not overstate incomplete law.",
    expectsDraftOutput: false,
    expectsComparisonMatrix: false,
  },

  case_comparison: {
    key: "case_comparison" as const,
    label: "Case Comparison",
    description: "Compare current matter against one or more authorities",
    priorities: [
      "Factual similarities",
      "Factual differences",
      "Governing test",
      "Binding vs persuasive weight",
      "Analogical usefulness",
      "Whether the authority helps or hurts",
    ],
    instruction:
      "Prioritize analogical analysis. " +
      "For each authority, identify material similarities, material differences, legal test alignment, " +
      "weight of authority, and whether the case is likely helpful, distinguishable, adverse, or mixed. " +
      "Avoid superficial comparisons. " +
      "Focus on the facts and legal features that genuinely affect applicability.",
    expectsDraftOutput: false,
    expectsComparisonMatrix: true,
  },

  draft_factum: {
    key: "draft_factum" as const,
    label: "Draft Factum",
    description: "Draft a factum skeleton or section draft",
    priorities: [
      "Structured advocacy",
      "Issues",
      "Legal test",
      "Application",
      "Relief",
      "Careful citation handling",
    ],
    instruction:
      "Draft in a professional Canadian appellate or motion-writing style, but remain source-disciplined. " +
      "Prefer a factum skeleton, argument section, or structured draft rather than polished unsupported rhetoric. " +
      "Do not fabricate authorities, quotations, or pinpoints. " +
      "Flag all propositions that still require citation verification. " +
      "Where the record or authorities are incomplete, say so directly inside the draft in a professional way.",
    expectsDraftOutput: true,
    expectsComparisonMatrix: false,
  },
} as const;

export type AnalysisMode = keyof typeof ANALYSIS_MODES;

export const ANALYSIS_MODE_KEYS = Object.keys(ANALYSIS_MODES) as AnalysisMode[];

export const DEFAULT_MODE: AnalysisMode = "memo";

export function getModeConfig(mode: AnalysisMode) {
  return ANALYSIS_MODES[mode];
}
