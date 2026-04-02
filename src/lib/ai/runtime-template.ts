/**
 * Runtime template builder for the Canadian Legal CoPilot.
 *
 * Constructs the typed user message payload from matter intake data,
 * documents, and runtime configuration.
 *
 * Source of truth: docs/AI-LEGAL-COPILOT-RUNTIME-TEMPLATE.md
 */

import type { AnalysisMode } from "./modes";
import { DEFAULT_CONSTRAINTS, type RuntimeConstraints } from "./guardrails";

// === Input types ===

export interface RuntimeJurisdiction {
  country: "Canada";
  province_or_territory: string;
  forum: string;
  legal_system: "common_law" | "civil_law";
}

export interface RuntimeMatter {
  title: string;
  area_of_law: string[];
  procedural_posture: string;
  desired_outcome: string;
  task: string;
}

export interface RuntimeFacts {
  undisputed_facts: string[];
  disputed_facts: string[];
  assumed_facts: string[];
  missing_facts: string[];
}

export interface RuntimeAuthority {
  id: string;
  type: "case" | "statute" | "regulation" | "tribunal_rule" | "secondary";
  title: string;
  citation: string;
  text_available: boolean;
  source_type: "uploaded_document" | "user_input_only" | "retrieved";
}

export interface RuntimeStatuteOrRule {
  id: string;
  title: string;
  citation: string;
  text_available: boolean;
  source_type: "uploaded_document" | "user_input_only" | "retrieved";
}

export interface RuntimeAuthorities {
  provided_authorities: RuntimeAuthority[];
  retrieved_authorities: RuntimeAuthority[];
  statutes_and_rules: RuntimeStatuteOrRule[];
}

export interface RuntimeDocument {
  id: string;
  filename: string;
  document_type: string;
  extraction_method: "PDF_PARSE" | "DOCX_PARSE" | "PLAIN_TEXT" | "OCR";
  excerpt: string;
}

export interface RuntimeStyle {
  tone: "professional";
  verbosity: "concise" | "medium" | "detailed";
  audience: "lawyer" | "client" | "judge";
  include_counterarguments: boolean;
  include_research_gaps: boolean;
  include_procedural_risks: boolean;
}

export interface RuntimeOutputPreferences {
  return_json_only: true;
  max_authorities: number;
  prefer_bulleted_reasoning: boolean;
}

// === Full runtime payload ===

export interface RuntimePayload {
  mode: AnalysisMode;
  user_name?: string;
  matter_id?: string;
  request_id?: string;
  jurisdiction: RuntimeJurisdiction;
  matter: RuntimeMatter;
  facts: RuntimeFacts;
  authorities: RuntimeAuthorities;
  documents?: RuntimeDocument[];
  constraints: RuntimeConstraints;
  style: RuntimeStyle;
  output_preferences: RuntimeOutputPreferences;
}

// === Builder ===

export interface BuildRuntimePayloadInput {
  mode: AnalysisMode;
  jurisdiction: RuntimeJurisdiction;
  matter: RuntimeMatter;
  facts: RuntimeFacts;
  authorities?: RuntimeAuthorities;
  documents?: RuntimeDocument[];
  userName?: string;
  matterId?: string;
  requestId?: string;
  constraintOverrides?: Partial<RuntimeConstraints>;
  verbosity?: RuntimeStyle["verbosity"];
}

/**
 * Build a typed runtime payload for the legal copilot.
 *
 * This is the JSON object serialized and sent as the user message content.
 */
export function buildRuntimePayload(
  input: BuildRuntimePayloadInput
): RuntimePayload {
  const constraints: RuntimeConstraints = {
    ...DEFAULT_CONSTRAINTS,
    ...input.constraintOverrides,
  };

  // OCR documents get a prefix warning in their excerpt
  const documents = input.documents?.map((doc) => {
    if (doc.extraction_method === "OCR" && !doc.excerpt.startsWith("[Note:")) {
      return {
        ...doc,
        excerpt: `[Note: This text was extracted via OCR and may contain errors.]\n${doc.excerpt}`,
      };
    }
    return doc;
  });

  const payload: RuntimePayload = {
    mode: input.mode,
    jurisdiction: input.jurisdiction,
    matter: input.matter,
    facts: input.facts,
    authorities: input.authorities ?? {
      provided_authorities: [],
      retrieved_authorities: [],
      statutes_and_rules: [],
    },
    constraints,
    style: {
      tone: "professional",
      verbosity: input.verbosity ?? "medium",
      audience: "lawyer",
      include_counterarguments: true,
      include_research_gaps: true,
      include_procedural_risks: true,
    },
    output_preferences: {
      return_json_only: true,
      max_authorities: 12,
      prefer_bulleted_reasoning: true,
    },
  };

  if (input.userName) payload.user_name = input.userName;
  if (input.matterId) payload.matter_id = input.matterId;
  if (input.requestId) payload.request_id = input.requestId;
  if (documents?.length) payload.documents = documents;

  return payload;
}

/**
 * Serialize a runtime payload to the JSON string sent as the user message.
 */
export function serializeRuntimePayload(payload: RuntimePayload): string {
  return JSON.stringify(payload, null, 2);
}
