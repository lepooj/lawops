/**
 * OpenAI API client for the legal copilot.
 *
 * Server-side only. API key from environment.
 * Sends the system prompt + mode instruction + schema instruction + serialized runtime payload.
 */

import OpenAI from "openai";
import {
  LEGAL_COPILOT_SYSTEM_PROMPT,
  SYSTEM_PROMPT_VERSION,
} from "@/lib/ai/system-prompt";
import { getModeConfig, type AnalysisMode } from "@/lib/ai/modes";
import {
  serializeRuntimePayload,
  type RuntimePayload,
} from "@/lib/ai/runtime-template";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1";

export interface ModelCallResult {
  ok: true;
  content: string;
  model: string;
  promptVersion: string;
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs: number;
}

export interface ModelCallError {
  ok: false;
  error: string;
  model: string;
  promptVersion: string;
  latencyMs: number;
}

export type ModelCallOutcome = ModelCallResult | ModelCallError;

/**
 * Explicit schema instruction appended to the system prompt.
 * This ensures the model knows the exact JSON shape even without API-level schema enforcement.
 */
const SCHEMA_INSTRUCTION = `
--- REQUIRED OUTPUT JSON SCHEMA ---
You MUST return a single JSON object with EXACTLY these top-level keys. Do not invent your own structure.

{
  "mode": "memo" | "strategy" | "case_comparison" | "draft_factum",
  "matter_summary": {
    "task": string,
    "jurisdiction": string,
    "forum": string,
    "procedural_posture": string,
    "area_of_law": string[],
    "requested_outcome": string,
    "summary": string
  },
  "issues": [{ "id": string, "issue": string, "importance": "high"|"medium"|"low", "status": "live"|"uncertain"|"fact_dependent"|"research_needed" }],
  "governing_law": [{ "topic": string, "rule_statement": string, "source_type": "case"|"statute"|"regulation"|"tribunal_rule"|"constitutional_principle"|"general_reasoning", "verification_status": "verified"|"provisional"|"unverified", "authority_ids": string[] }],
  "authorities": [{ "id": string, "title": string, "type": "case"|"statute"|"regulation"|"tribunal_rule"|"secondary", "citation": string, "jurisdiction": string, "court_or_source": string, "year": number|null, "weight": "binding"|"persuasive"|"contextual"|"uncertain", "relevance": string, "treatment": "supports"|"distinguishes"|"cuts_against"|"background_only", "pinpoint": string|null, "quoted_text": string|null, "verification_status": "verified"|"provisional"|"unverified" }],
  "application": { "core_analysis": string[], "strongest_arguments": string[], "weaknesses": string[], "fact_dependencies": string[] },
  "counterarguments": string[],
  "procedural_considerations": string[],
  "missing_facts": string[],
  "research_gaps": string[],
  "recommended_next_steps": string[],
  "draft_output": null | { "document_type": string, "title": string, "body": string, "sections": [{ "heading": string, "content": string }] },
  "comparison_matrix": null | [{ "point": string, "current_matter": string, "authority": string, "effect": "helps"|"hurts"|"mixed"|"unclear" }],
  "confidence": { "overall": "high"|"moderate"|"low", "reason": string, "depends_on": string[], "rough_strength_assessment": "strong"|"moderate"|"mixed"|"uncertain"|"weak"|null },
  "verification": { "used_only_provided_and_retrieved_sources": boolean, "contains_unverified_points": boolean, "unverified_point_count": integer, "needs_human_legal_review": boolean, "notes": string[] },
  "disclaimer": string (non-empty)
}

Every field listed above is REQUIRED (except draft_output and comparison_matrix which can be null).
Do NOT wrap the output in any other object. The root of your JSON must have "mode" as the first key.

IMPORTANT: You MUST populate the "authorities" array with relevant legal authorities.
- Include well-known cases, statutes, and regulations relevant to the jurisdiction and area of law.
- Authorities you know from training should have verification_status "provisional".
- Authorities provided by the user in the input should have verification_status "verified".
- Do NOT leave authorities empty. A legal memo without cited authorities is not useful.
- Mark each authority's weight as "binding", "persuasive", "contextual", or "uncertain".
`;

/**
 * Call the OpenAI API with the legal copilot system prompt + runtime payload.
 */
export async function callLegalCopilot(
  payload: RuntimePayload,
  mode: AnalysisMode
): Promise<ModelCallOutcome> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "OPENAI_API_KEY is not configured.",
      model: MODEL,
      promptVersion: SYSTEM_PROMPT_VERSION,
      latencyMs: 0,
    };
  }

  const client = new OpenAI({ apiKey });
  const modeConfig = getModeConfig(mode);

  const systemMessage =
    LEGAL_COPILOT_SYSTEM_PROMPT +
    "\n\n--- MODE INSTRUCTION ---\n" +
    modeConfig.instruction +
    "\n" +
    SCHEMA_INSTRUCTION;

  const userMessage = serializeRuntimePayload(payload);

  const start = Date.now();

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "developer", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 16000,
      response_format: { type: "json_object" },
    });

    const latencyMs = Date.now() - start;
    const choice = response.choices[0];
    const content = choice?.message?.content;

    if (!content) {
      return {
        ok: false,
        error: "Model returned empty response.",
        model: MODEL,
        promptVersion: SYSTEM_PROMPT_VERSION,
        latencyMs,
      };
    }

    return {
      ok: true,
      content,
      model: response.model ?? MODEL,
      promptVersion: SYSTEM_PROMPT_VERSION,
      inputTokens: response.usage?.prompt_tokens ?? null,
      outputTokens: response.usage?.completion_tokens ?? null,
      latencyMs,
    };
  } catch (e) {
    const latencyMs = Date.now() - start;
    const message =
      e instanceof Error ? e.message : "Unknown OpenAI API error";

    return {
      ok: false,
      error: message,
      model: MODEL,
      promptVersion: SYSTEM_PROMPT_VERSION,
      latencyMs,
    };
  }
}
