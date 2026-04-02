/**
 * Structured output schema for the Canadian Legal CoPilot.
 *
 * Zod schemas defining the exact shape of model output.
 * The model must return valid JSON matching this schema.
 *
 * Source of truth: docs/AI-LEGAL-COPILOT-OUTPUT-SCHEMA.md
 */

import { z } from "zod";

// === Enums ===

export const AnalysisModeEnum = z.enum([
  "memo",
  "strategy",
  "case_comparison",
  "draft_factum",
]);

export const ImportanceEnum = z.enum(["high", "medium", "low"]);

export const IssueStatusEnum = z.enum([
  "live",
  "uncertain",
  "fact_dependent",
  "research_needed",
]);

export const SourceTypeEnum = z.enum([
  "case",
  "statute",
  "regulation",
  "tribunal_rule",
  "constitutional_principle",
  "general_reasoning",
]);

export const AuthorityTypeEnum = z.enum([
  "case",
  "statute",
  "regulation",
  "tribunal_rule",
  "secondary",
]);

export const AuthorityWeightEnum = z.enum([
  "binding",
  "persuasive",
  "contextual",
  "uncertain",
]);

export const TreatmentEnum = z.enum([
  "supports",
  "distinguishes",
  "cuts_against",
  "background_only",
]);

export const VerificationStatusEnum = z.enum([
  "verified",
  "provisional",
  "unverified",
]);

export const ConfidenceLevelEnum = z.enum(["high", "moderate", "low"]);

export const StrengthAssessmentEnum = z
  .enum(["strong", "moderate", "mixed", "uncertain", "weak"])
  .nullable();

export const ComparisonEffectEnum = z.enum([
  "helps",
  "hurts",
  "mixed",
  "unclear",
]);

export const DraftDocumentTypeEnum = z.enum([
  "memo",
  "strategy_note",
  "comparison_chart",
  "factum_section",
]);

// === Sub-schemas ===

export const MatterSummarySchema = z.object({
  task: z.string(),
  jurisdiction: z.string(),
  forum: z.string(),
  procedural_posture: z.string(),
  area_of_law: z.array(z.string()),
  requested_outcome: z.string(),
  summary: z.string(),
});

export const IssueSchema = z.object({
  id: z.string(),
  issue: z.string(),
  importance: ImportanceEnum,
  status: IssueStatusEnum,
});

export const GoverningLawEntrySchema = z.object({
  topic: z.string(),
  rule_statement: z.string(),
  source_type: SourceTypeEnum,
  verification_status: VerificationStatusEnum,
  authority_ids: z.array(z.string()).optional(),
});

export const AuthoritySchema = z.object({
  id: z.string(),
  title: z.string(),
  type: AuthorityTypeEnum,
  citation: z.string(),
  jurisdiction: z.string(),
  court_or_source: z.string().optional(),
  year: z.number().int().nullable().optional(),
  weight: AuthorityWeightEnum,
  relevance: z.string(),
  treatment: TreatmentEnum,
  pinpoint: z.string().nullable().optional(),
  quoted_text: z.string().nullable().optional(),
  verification_status: VerificationStatusEnum,
});

export const ApplicationSchema = z.object({
  core_analysis: z.array(z.string()),
  strongest_arguments: z.array(z.string()),
  weaknesses: z.array(z.string()),
  fact_dependencies: z.array(z.string()),
});

export const ConfidenceSchema = z.object({
  overall: ConfidenceLevelEnum,
  reason: z.string(),
  depends_on: z.array(z.string()),
  rough_strength_assessment: StrengthAssessmentEnum.optional(),
});

export const VerificationSchema = z.object({
  used_only_provided_and_retrieved_sources: z.boolean(),
  contains_unverified_points: z.boolean(),
  unverified_point_count: z.number().int().min(0),
  needs_human_legal_review: z.boolean(),
  notes: z.array(z.string()).optional(),
});

export const DraftSectionSchema = z.object({
  heading: z.string(),
  content: z.string(),
});

export const DraftOutputSchema = z
  .object({
    document_type: z.string(), // Relaxed from enum — models produce varied labels
    title: z.string(),
    body: z.string(),
    sections: z.array(DraftSectionSchema).optional(),
  })
  .nullable();

export const ComparisonMatrixEntrySchema = z.object({
  point: z.string(),
  current_matter: z.string(),
  authority: z.string(),
  effect: ComparisonEffectEnum,
});

// === Top-level output schema ===

export const CopilotOutputSchema = z.object({
  mode: AnalysisModeEnum,
  matter_summary: MatterSummarySchema,
  issues: z.array(IssueSchema),
  governing_law: z.array(GoverningLawEntrySchema),
  authorities: z.array(AuthoritySchema),
  application: ApplicationSchema,
  counterarguments: z.array(z.string()),
  procedural_considerations: z.array(z.string()),
  missing_facts: z.array(z.string()),
  research_gaps: z.array(z.string()),
  recommended_next_steps: z.array(z.string()),
  draft_output: DraftOutputSchema.optional(),
  comparison_matrix: z.array(ComparisonMatrixEntrySchema).nullable().optional(),
  confidence: ConfidenceSchema,
  verification: VerificationSchema,
  disclaimer: z.string().min(1),
});

// === Inferred types ===

export type CopilotOutput = z.infer<typeof CopilotOutputSchema>;
export type MatterSummary = z.infer<typeof MatterSummarySchema>;
export type Issue = z.infer<typeof IssueSchema>;
export type GoverningLawEntry = z.infer<typeof GoverningLawEntrySchema>;
export type Authority = z.infer<typeof AuthoritySchema>;
export type Application = z.infer<typeof ApplicationSchema>;
export type Confidence = z.infer<typeof ConfidenceSchema>;
export type Verification = z.infer<typeof VerificationSchema>;
export type DraftOutput = z.infer<typeof DraftOutputSchema>;
export type DraftSection = z.infer<typeof DraftSectionSchema>;
export type ComparisonMatrixEntry = z.infer<typeof ComparisonMatrixEntrySchema>;

// === JSON Schema export ===

/**
 * Convert the Zod schema to a JSON-schema-compatible object.
 *
 * This is used for:
 * - OpenAI structured output (response_format.json_schema)
 * - Documentation generation
 * - Future API contract validation
 *
 * Note: zod-to-json-schema is not a dependency yet. When the live LLM
 * integration is built (Phase 5), install it and use this function.
 * Until then, the Zod schema is the authoritative definition.
 *
 * Usage (Phase 5):
 *   import { zodToJsonSchema } from "zod-to-json-schema";
 *   const jsonSchema = zodToJsonSchema(CopilotOutputSchema, "CopilotOutput");
 */
export function getJsonSchemaPlaceholder(): {
  note: string;
  zodSchemaAvailable: true;
} {
  return {
    note: "Install zod-to-json-schema and call zodToJsonSchema(CopilotOutputSchema) for OpenAI structured output integration.",
    zodSchemaAvailable: true,
  };
}
