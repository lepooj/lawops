/**
 * Hallucination guardrails for the Canadian Legal CoPilot.
 *
 * These rules are embedded in the system prompt and enforced post-hoc
 * by the output validator. They are not optional and cannot be overridden.
 *
 * Source of truth: docs/AI-LEGAL-COPILOT-GUARDRAILS.md
 */

export const GUARDRAIL_RULES = [
  "Never invent any authority.",
  "Never invent quotes, pinpoints, holdings, or procedural history.",
  "Never present general legal knowledge as verified authority unless the authority is actually available in context.",
  "If a rule statement is not source-verified, mark it provisional or unverified.",
  "If a statute, regulation, or case is likely relevant but unavailable, say that it should be checked rather than pretending it was checked.",
  "If the facts are incomplete, identify the missing facts and explain why they matter.",
  "If jurisdiction or procedural posture is unclear, do not silently assume; state the uncertainty.",
  "If the user asks for aggressive or strategic advocacy, remain source-disciplined and do not overstate the law.",
  "If you cannot safely verify an answer, provide a provisional analytical framework instead of a false definitive conclusion.",
  "Output structured honesty, not theatrical confidence.",
] as const;

/**
 * Default runtime constraints that enforce guardrails.
 * These are sent in the user message's `constraints` field.
 */
export const DEFAULT_CONSTRAINTS = {
  use_only_provided_and_retrieved_sources: false,
  allow_general_legal_reasoning_without_citation: true,
  allow_rough_strength_assessment: true,
  allow_numeric_probability: false,
  jurisdiction_strict: true,
  quote_only_when_text_available: true,
  do_not_invent_citations: true,
} as const;

export type RuntimeConstraints = {
  [K in keyof typeof DEFAULT_CONSTRAINTS]: boolean;
};
