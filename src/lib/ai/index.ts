/**
 * AI Legal CoPilot — public API surface.
 *
 * Re-exports the typed contracts for the legal copilot intelligence layer.
 * No live LLM calls — this module defines the contract only.
 */

// System prompt
export {
  LEGAL_COPILOT_SYSTEM_PROMPT,
  SYSTEM_PROMPT_VERSION,
} from "./system-prompt";

// Modes
export {
  ANALYSIS_MODES,
  ANALYSIS_MODE_KEYS,
  DEFAULT_MODE,
  getModeConfig,
  type AnalysisMode,
} from "./modes";

// Guardrails
export {
  GUARDRAIL_RULES,
  DEFAULT_CONSTRAINTS,
  type RuntimeConstraints,
} from "./guardrails";

// Output schema and types
export {
  CopilotOutputSchema,
  getJsonSchemaPlaceholder,
  type CopilotOutput,
  type MatterSummary,
  type Issue,
  type GoverningLawEntry,
  type Authority,
  type Application,
  type Confidence,
  type Verification,
  type DraftOutput,
  type DraftSection,
  type ComparisonMatrixEntry,
} from "./output-schema";

// Validator
export {
  validateCopilotOutput,
  safeParseModelJson,
  type ValidationResult,
  type ValidationSuccess,
  type ValidationFailure,
  type ValidationError,
  type ValidationWarning,
  type ErrorCode,
  type WarningCode,
  type OutputStats,
} from "./output-validator";

// Runtime template
export {
  buildRuntimePayload,
  serializeRuntimePayload,
  type RuntimePayload,
  type RuntimeJurisdiction,
  type RuntimeMatter,
  type RuntimeFacts,
  type RuntimeAuthority,
  type RuntimeStatuteOrRule,
  type RuntimeAuthorities,
  type RuntimeDocument,
  type RuntimeStyle,
  type RuntimeOutputPreferences,
  type BuildRuntimePayloadInput,
} from "./runtime-template";
