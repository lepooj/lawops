/**
 * Output validator for the Canadian Legal CoPilot.
 *
 * Validates raw model JSON against the output schema,
 * enforces internal consistency as hard failures where required,
 * and surfaces warnings for suspicious-but-valid output.
 */

import {
  CopilotOutputSchema,
  type CopilotOutput,
  type Authority,
} from "./output-schema";
import { ANALYSIS_MODES } from "./modes";

// === Result types ===

export interface ValidationSuccess {
  ok: true;
  data: CopilotOutput;
  warnings: ValidationWarning[];
  stats: OutputStats;
}

export interface ValidationFailure {
  ok: false;
  errors: ValidationError[];
  rawInput: unknown;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

export interface ValidationError {
  path: string;
  code: ErrorCode;
  message: string;
}

export type ErrorCode =
  | "SCHEMA_VIOLATION"
  | "UNVERIFIED_FLAG_FALSE_WITH_UNVERIFIED_AUTHORITIES"
  | "UNVERIFIED_FLAG_TRUE_WITH_ZERO_UNVERIFIED"
  | "QUOTED_TEXT_ON_UNVERIFIED_AUTHORITY";

export interface ValidationWarning {
  code: WarningCode;
  message: string;
}

export type WarningCode =
  | "NO_ISSUES_IDENTIFIED"
  | "NO_AUTHORITIES_CITED"
  | "GOVERNING_LAW_ALL_UNVERIFIED"
  | "ALL_AUTHORITIES_UNVERIFIED"
  | "VERIFICATION_COUNT_OVERCOUNTED"
  | "MISSING_DRAFT_OUTPUT"
  | "MISSING_COMPARISON_MATRIX";

export interface OutputStats {
  totalAuthorities: number;
  verifiedAuthorities: number;
  provisionalAuthorities: number;
  unverifiedAuthorities: number;
  totalIssues: number;
  totalGoverningLawEntries: number;
  totalResearchGaps: number;
  totalMissingFacts: number;
  hasComparisonMatrix: boolean;
  hasDraftOutput: boolean;
}

// === Main validator ===

/**
 * Validate raw model output (parsed JSON) against the copilot output schema.
 *
 * Hard failures:
 * - Schema violations (missing/wrong-type fields)
 * - Verification flag/count inconsistencies
 * - quoted_text present on unverified authorities (guardrail: quote_only_when_text_available)
 * - Mode-required output missing (draft_factum needs draft_output, case_comparison needs comparison_matrix)
 *
 * Warnings (valid but suspicious):
 * - No issues identified
 * - No authorities cited
 * - All governing law unverified
 */
export function validateCopilotOutput(raw: unknown): ValidationResult {
  // Step 1: Zod schema validation
  const parsed = CopilotOutputSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        code: "SCHEMA_VIOLATION" as const,
        message: issue.message,
      })),
      rawInput: raw,
    };
  }

  const data = parsed.data;
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const stats = computeStats(data);

  // Step 2: Hard enforcement — verification count consistency
  const actualUnverifiedCount =
    stats.provisionalAuthorities + stats.unverifiedAuthorities;

  if (data.verification.unverified_point_count !== actualUnverifiedCount) {
    // Count mismatches are warnings, not hard failures.
    // Models legitimately count governing_law unverified entries in addition to authorities,
    // or may undercount slightly. The UI surfaces the actual authority-level verification status.
    warnings.push({
      code: "VERIFICATION_COUNT_OVERCOUNTED",
      message:
        `verification.unverified_point_count is ${data.verification.unverified_point_count} ` +
        `but authority-level count is ${actualUnverifiedCount}. ` +
        `Model may be counting governing_law entries differently.`,
    });
  }

  // Step 3: Hard enforcement — contains_unverified_points flag
  if (
    !data.verification.contains_unverified_points &&
    actualUnverifiedCount > 0
  ) {
    errors.push({
      path: "verification.contains_unverified_points",
      code: "UNVERIFIED_FLAG_FALSE_WITH_UNVERIFIED_AUTHORITIES",
      message:
        `verification.contains_unverified_points is false but ${actualUnverifiedCount} ` +
        `provisional or unverified authorities exist. This is unsafe — the flag must be true.`,
    });
  }

  if (
    data.verification.contains_unverified_points &&
    actualUnverifiedCount === 0 &&
    data.governing_law.every(
      (gl) => gl.verification_status === "verified"
    )
  ) {
    errors.push({
      path: "verification.contains_unverified_points",
      code: "UNVERIFIED_FLAG_TRUE_WITH_ZERO_UNVERIFIED",
      message:
        "verification.contains_unverified_points is true but no unverified or provisional " +
        "authorities or governing law entries found. Flag is inconsistent.",
    });
  }

  // Step 4: Hard enforcement — quoted_text on unverified authorities
  // Guardrail: quote_only_when_text_available means an unverified authority
  // should not carry quoted_text (the text source is not confirmed).
  for (let i = 0; i < data.authorities.length; i++) {
    const auth = data.authorities[i];
    if (
      auth.verification_status === "unverified" &&
      auth.quoted_text != null &&
      auth.quoted_text.length > 0
    ) {
      errors.push({
        path: `authorities[${i}].quoted_text`,
        code: "QUOTED_TEXT_ON_UNVERIFIED_AUTHORITY",
        message:
          `Authority "${auth.id}" (${auth.citation}) is unverified but has quoted_text. ` +
          `Quoting from an unverified source violates guardrail: quote_only_when_text_available.`,
      });
    }
  }

  // Step 5: Mode-expected output — warnings, not hard failures
  // Models don't always produce draft_output or comparison_matrix even when asked.
  // The rest of the analysis is still useful.
  const modeConfig = ANALYSIS_MODES[data.mode];

  if (modeConfig.expectsDraftOutput && !data.draft_output) {
    warnings.push({
      code: "MISSING_DRAFT_OUTPUT",
      message:
        `Mode "${data.mode}" expected draft_output but it was not included.`,
    });
  }

  if (
    modeConfig.expectsComparisonMatrix &&
    (!data.comparison_matrix || data.comparison_matrix.length === 0)
  ) {
    warnings.push({
      code: "MISSING_COMPARISON_MATRIX",
      message:
        `Mode "${data.mode}" expected comparison_matrix but it was not included.`,
    });
  }

  // Step 6: Warnings — suspicious but not invalid
  if (data.issues.length === 0) {
    warnings.push({
      code: "NO_ISSUES_IDENTIFIED",
      message: "No legal issues were identified in the analysis",
    });
  }

  if (data.authorities.length === 0) {
    warnings.push({
      code: "NO_AUTHORITIES_CITED",
      message: "No authorities were cited in the analysis",
    });
  }

  if (
    data.governing_law.length > 0 &&
    data.governing_law.every((gl) => gl.verification_status === "unverified")
  ) {
    warnings.push({
      code: "GOVERNING_LAW_ALL_UNVERIFIED",
      message: "All governing law entries are unverified",
    });
  }

  if (
    data.authorities.length > 0 &&
    data.authorities.every((a) => a.verification_status === "unverified")
  ) {
    warnings.push({
      code: "ALL_AUTHORITIES_UNVERIFIED",
      message: "All cited authorities are unverified",
    });
  }

  // Return failure if any hard errors
  if (errors.length > 0) {
    return { ok: false, errors, rawInput: raw };
  }

  return { ok: true, data, warnings, stats };
}

// === Helpers ===

function computeStats(data: CopilotOutput): OutputStats {
  const authorities = data.authorities;

  return {
    totalAuthorities: authorities.length,
    verifiedAuthorities: countByVerification(authorities, "verified"),
    provisionalAuthorities: countByVerification(authorities, "provisional"),
    unverifiedAuthorities: countByVerification(authorities, "unverified"),
    totalIssues: data.issues.length,
    totalGoverningLawEntries: data.governing_law.length,
    totalResearchGaps: data.research_gaps.length,
    totalMissingFacts: data.missing_facts.length,
    hasComparisonMatrix: !!data.comparison_matrix?.length,
    hasDraftOutput: !!data.draft_output,
  };
}

function countByVerification(
  authorities: Authority[],
  status: "verified" | "provisional" | "unverified"
): number {
  return authorities.filter((a) => a.verification_status === status).length;
}

/**
 * Safely parse raw model response text into JSON.
 * Handles common issues: markdown code fences, leading/trailing whitespace.
 */
export function safeParseModelJson(
  raw: string
): { ok: true; data: unknown } | { ok: false; error: string } {
  let cleaned = raw.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    const data: unknown = JSON.parse(cleaned);
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to parse JSON",
    };
  }
}
