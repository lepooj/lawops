/**
 * Builds the runtime payload for the legal copilot from matter data.
 *
 * Transforms Prisma entities (MatterIntake, Document[]) into the
 * typed BuildRuntimePayloadInput that the AI contract layer expects.
 */

import type { MatterIntake, Document as PrismaDocument } from "@prisma/client";
import type { AnalysisMode } from "@/lib/ai/modes";
import {
  buildRuntimePayload,
  type BuildRuntimePayloadInput,
  type RuntimeDocument,
  type RuntimeAuthority,
} from "@/lib/ai/runtime-template";
import { stripHtml } from "@/components/intake/intake-types";
import { MAX_DOC_EXCERPT_CHARS } from "@/lib/constants";

interface AnalysisInputOptions {
  mode: AnalysisMode;
  matterId: string;
  matterTitle: string;
  intake: MatterIntake;
  documents: Pick<
    PrismaDocument,
    | "id"
    | "originalFilename"
    | "documentType"
    | "extractionMethod"
    | "extractionStatus"
    | "extractedText"
    | "includeInAnalysis"
  >[];
  userName?: string;
}

export interface AnalysisInputResult {
  ok: true;
  payload: ReturnType<typeof buildRuntimePayload>;
  documentExcerpts: DocumentExcerptSnapshot[];
  inputSnapshot: Record<string, unknown>;
  hasOcrDocuments: boolean;
}

export interface AnalysisInputError {
  ok: false;
  error: string;
}

export interface DocumentExcerptSnapshot {
  docId: string;
  filename: string;
  type: string;
  excerpt: string;
  method: string;
}

export function buildAnalysisInput(
  options: AnalysisInputOptions
): AnalysisInputResult | AnalysisInputError {
  const { mode, matterId, matterTitle, intake, documents, userName } = options;

  // Validate minimum intake
  const province = intake.province?.trim();
  if (!province) {
    return { ok: false, error: "Jurisdiction (province) is required." };
  }

  const facts = stripHtml(intake.facts ?? "");
  if (facts.length < 10) {
    return { ok: false, error: "Facts narrative is too short (minimum 10 characters)." };
  }

  const desiredOutcome = (intake.desiredOutcome ?? "").trim();
  if (desiredOutcome.length < 5) {
    return { ok: false, error: "Desired outcome is required." };
  }

  // Build document excerpts — only included docs with usable text
  const usableDocs = documents.filter(
    (d) =>
      d.includeInAnalysis &&
      d.extractionStatus === "COMPLETE" &&
      d.extractedText &&
      d.extractedText.trim().length > 0
  );

  const runtimeDocs: RuntimeDocument[] = usableDocs.map((d) => ({
    id: d.id,
    filename: d.originalFilename,
    document_type: d.documentType,
    extraction_method: d.extractionMethod ?? "PLAIN_TEXT",
    excerpt: (d.extractedText ?? "").slice(0, MAX_DOC_EXCERPT_CHARS),
  }));

  const documentExcerpts: DocumentExcerptSnapshot[] = usableDocs.map((d) => ({
    docId: d.id,
    filename: d.originalFilename,
    type: d.documentType,
    excerpt: (d.extractedText ?? "").slice(0, MAX_DOC_EXCERPT_CHARS),
    method: d.extractionMethod ?? "PLAIN_TEXT",
  }));

  const hasOcrDocuments = usableDocs.some((d) => d.extractionMethod === "OCR");

  // Parse user-provided authorities from intake JSON
  const supportingAuthorities = parseAuthorities(intake.supportingAuthorities);
  const opposingAuthorities = parseAuthorities(intake.opposingAuthorities);

  const providedAuthorities: RuntimeAuthority[] = [
    ...supportingAuthorities.map((a, i) => ({
      id: `user-sup-${i}`,
      type: "case" as const,
      title: a.caseName,
      citation: a.citation,
      text_available: false,
      source_type: "user_input_only" as const,
    })),
    ...opposingAuthorities.map((a, i) => ({
      id: `user-opp-${i}`,
      type: "case" as const,
      title: a.caseName,
      citation: a.citation,
      text_available: false,
      source_type: "user_input_only" as const,
    })),
  ];

  const legalSystem =
    province === "Quebec" ? ("civil_law" as const) : ("common_law" as const);

  const payloadInput: BuildRuntimePayloadInput = {
    mode,
    matterId,
    userName,
    jurisdiction: {
      country: "Canada",
      province_or_territory: province,
      forum: intake.courtLevel?.trim() || "Not specified",
      legal_system: legalSystem,
    },
    matter: {
      title: matterTitle,
      area_of_law: intake.areaOfLaw ? [intake.areaOfLaw] : [],
      procedural_posture: intake.proceduralStage?.trim() || "Not specified",
      desired_outcome: desiredOutcome,
      task: `Analyze this matter in ${mode} mode`,
    },
    facts: {
      undisputed_facts: facts ? [facts] : [],
      disputed_facts: [],
      assumed_facts: [],
      missing_facts: [],
    },
    authorities: {
      provided_authorities: providedAuthorities,
      retrieved_authorities: [],
      statutes_and_rules: [],
    },
    documents: runtimeDocs.length > 0 ? runtimeDocs : undefined,
  };

  const payload = buildRuntimePayload(payloadInput);

  // Build input snapshot for traceability
  const inputSnapshot = {
    province,
    courtLevel: intake.courtLevel,
    jurisdictionType: intake.jurisdictionType,
    areaOfLaw: intake.areaOfLaw,
    facts: intake.facts,
    parties: intake.parties,
    desiredOutcome: intake.desiredOutcome,
    constraints: intake.constraints,
    proceduralStage: intake.proceduralStage,
    priorDecisions: intake.priorDecisions,
    keyDates: intake.keyDates,
    supportingAuthorities: intake.supportingAuthorities,
    opposingArguments: intake.opposingArguments,
    opposingAuthorities: intake.opposingAuthorities,
  };

  return { ok: true, payload, documentExcerpts, inputSnapshot, hasOcrDocuments };
}

function parseAuthorities(
  json: unknown
): { caseName: string; citation: string; relevance: string }[] {
  if (!Array.isArray(json)) return [];
  return json.filter(
    (a) =>
      a &&
      typeof a === "object" &&
      typeof a.caseName === "string" &&
      a.caseName.trim().length > 0 &&
      typeof a.citation === "string" &&
      a.citation.trim().length > 0
  );
}
