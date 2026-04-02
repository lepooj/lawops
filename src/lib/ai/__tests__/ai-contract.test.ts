/**
 * Tests for the AI Legal CoPilot contract layer.
 *
 * Covers: output validation, verification enforcement, mode enforcement,
 * guardrail enforcement, runtime template behavior, mode registry.
 */

import {
  validateCopilotOutput,
  safeParseModelJson,
  buildRuntimePayload,
  ANALYSIS_MODES,
  ANALYSIS_MODE_KEYS,
  DEFAULT_MODE,
  getModeConfig,
  GUARDRAIL_RULES,
  DEFAULT_CONSTRAINTS,
  SYSTEM_PROMPT_VERSION,
  LEGAL_COPILOT_SYSTEM_PROMPT,
  type CopilotOutput,
  type BuildRuntimePayloadInput,
} from "../index";

// === Test fixtures ===

/** Minimal valid output that passes all validation. */
function makeValidOutput(
  overrides?: Partial<CopilotOutput>
): CopilotOutput {
  return {
    mode: "memo",
    matter_summary: {
      task: "Analyze viability of application",
      jurisdiction: "Ontario",
      forum: "Superior Court of Justice",
      procedural_posture: "pre-application",
      area_of_law: ["administrative"],
      requested_outcome: "Assess prospects",
      summary: "Analysis of administrative law matter",
    },
    issues: [
      {
        id: "I1",
        issue: "Whether the decision is reviewable",
        importance: "high",
        status: "live",
      },
    ],
    governing_law: [
      {
        topic: "Standard of review",
        rule_statement: "Reasonableness is the presumptive standard",
        source_type: "case",
        verification_status: "verified",
        authority_ids: ["A1"],
      },
    ],
    authorities: [
      {
        id: "A1",
        title: "Test Authority",
        type: "case",
        citation: "2021 SCC 1",
        jurisdiction: "Canada",
        weight: "binding",
        relevance: "Establishes standard of review framework",
        treatment: "supports",
        verification_status: "verified",
      },
    ],
    application: {
      core_analysis: ["The decision appears reviewable on reasonableness grounds"],
      strongest_arguments: ["Clear jurisdictional error"],
      weaknesses: ["Timing may be an issue"],
      fact_dependencies: ["Full reasons required"],
    },
    counterarguments: ["Respondent may argue deference"],
    procedural_considerations: ["Filing deadline approaching"],
    missing_facts: ["Written reasons not yet received"],
    research_gaps: ["Current state of limitation provisions"],
    recommended_next_steps: ["Obtain written reasons"],
    confidence: {
      overall: "moderate",
      reason: "Pending receipt of reasons",
      depends_on: ["Content of written reasons"],
    },
    verification: {
      used_only_provided_and_retrieved_sources: true,
      contains_unverified_points: false,
      unverified_point_count: 0,
      needs_human_legal_review: true,
    },
    disclaimer:
      "This analysis is AI-generated and requires independent legal review before reliance.",
    ...overrides,
  };
}

function makeMinimalRuntimeInput(): BuildRuntimePayloadInput {
  return {
    mode: "memo",
    jurisdiction: {
      country: "Canada",
      province_or_territory: "Ontario",
      forum: "Ontario Superior Court of Justice",
      legal_system: "common_law",
    },
    matter: {
      title: "Test matter",
      area_of_law: ["administrative"],
      procedural_posture: "pre-application",
      desired_outcome: "Test outcome",
      task: "Test task",
    },
    facts: {
      undisputed_facts: ["Fact one"],
      disputed_facts: [],
      assumed_facts: [],
      missing_facts: [],
    },
  };
}

// === Schema validation ===

describe("validateCopilotOutput", () => {
  it("accepts valid output", () => {
    const result = validateCopilotOutput(makeValidOutput());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.mode).toBe("memo");
      expect(result.warnings).toHaveLength(0);
      expect(result.stats.totalAuthorities).toBe(1);
      expect(result.stats.verifiedAuthorities).toBe(1);
    }
  });

  it("rejects missing required fields", () => {
    const result = validateCopilotOutput({ mode: "memo" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe("SCHEMA_VIOLATION");
    }
  });

  it("rejects invalid mode enum", () => {
    const result = validateCopilotOutput(
      makeValidOutput({ mode: "invalid_mode" as never })
    );
    expect(result.ok).toBe(false);
  });

  it("rejects empty disclaimer", () => {
    const result = validateCopilotOutput(
      makeValidOutput({ disclaimer: "" })
    );
    expect(result.ok).toBe(false);
  });

  it("rejects non-object input", () => {
    const result = validateCopilotOutput("not an object");
    expect(result.ok).toBe(false);
  });

  it("rejects null input", () => {
    const result = validateCopilotOutput(null);
    expect(result.ok).toBe(false);
  });
});

// === Verification enforcement ===

describe("verification count enforcement", () => {
  it("warns when unverified_point_count mismatches actual unverified authorities", () => {
    const output = makeValidOutput({
      authorities: [
        {
          id: "A1",
          title: "Test",
          type: "case",
          citation: "2021 SCC 1",
          jurisdiction: "Canada",
          weight: "binding",
          relevance: "Relevant",
          treatment: "supports",
          verification_status: "unverified",
        },
        {
          id: "A2",
          title: "Test 2",
          type: "case",
          citation: "2022 ONCA 1",
          jurisdiction: "Ontario",
          weight: "persuasive",
          relevance: "Also relevant",
          treatment: "supports",
          verification_status: "provisional",
        },
      ],
      verification: {
        used_only_provided_and_retrieved_sources: true,
        contains_unverified_points: true,
        unverified_point_count: 1, // actual is 2 — now a warning, not failure
        needs_human_legal_review: true,
      },
    });

    const result = validateCopilotOutput(output);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings.some((w) => w.code === "VERIFICATION_COUNT_OVERCOUNTED")).toBe(true);
    }
  });

  it("warns (not fails) when unverified_point_count overcounts", () => {
    const output = makeValidOutput({
      authorities: [
        {
          id: "A1",
          title: "Test",
          type: "case",
          citation: "2021 SCC 1",
          jurisdiction: "Canada",
          weight: "binding",
          relevance: "Relevant",
          treatment: "supports",
          verification_status: "provisional",
        },
      ],
      verification: {
        used_only_provided_and_retrieved_sources: true,
        contains_unverified_points: true,
        unverified_point_count: 3, // actual is 1
        needs_human_legal_review: true,
      },
    });

    const result = validateCopilotOutput(output);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings.some((w) => w.code === "VERIFICATION_COUNT_OVERCOUNTED")).toBe(true);
    }
  });

  it("fails when contains_unverified_points is false but unverified authorities exist", () => {
    const output = makeValidOutput({
      authorities: [
        {
          id: "A1",
          title: "Test",
          type: "case",
          citation: "2021 SCC 1",
          jurisdiction: "Canada",
          weight: "binding",
          relevance: "Relevant",
          treatment: "supports",
          verification_status: "unverified",
        },
      ],
      verification: {
        used_only_provided_and_retrieved_sources: true,
        contains_unverified_points: false, // lying
        unverified_point_count: 1,
        needs_human_legal_review: true,
      },
    });

    const result = validateCopilotOutput(output);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.errors.some(
          (e) => e.code === "UNVERIFIED_FLAG_FALSE_WITH_UNVERIFIED_AUTHORITIES"
        )
      ).toBe(true);
    }
  });
});

// === Quoted text guardrail ===

describe("quoted_text guardrail enforcement", () => {
  it("fails when unverified authority has quoted_text", () => {
    const output = makeValidOutput({
      authorities: [
        {
          id: "A1",
          title: "Test",
          type: "case",
          citation: "2021 SCC 1",
          jurisdiction: "Canada",
          weight: "binding",
          relevance: "Relevant",
          treatment: "supports",
          verification_status: "unverified",
          quoted_text: "This is a fabricated quote from an unverified source",
        },
      ],
      verification: {
        used_only_provided_and_retrieved_sources: true,
        contains_unverified_points: true,
        unverified_point_count: 1,
        needs_human_legal_review: true,
      },
    });

    const result = validateCopilotOutput(output);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.errors.some((e) => e.code === "QUOTED_TEXT_ON_UNVERIFIED_AUTHORITY")
      ).toBe(true);
    }
  });

  it("allows quoted_text on verified authority", () => {
    const output = makeValidOutput({
      authorities: [
        {
          id: "A1",
          title: "Test",
          type: "case",
          citation: "2021 SCC 1",
          jurisdiction: "Canada",
          weight: "binding",
          relevance: "Relevant",
          treatment: "supports",
          verification_status: "verified",
          quoted_text: "Actual quote from verified source",
        },
      ],
    });

    const result = validateCopilotOutput(output);
    expect(result.ok).toBe(true);
  });

  it("allows null quoted_text on unverified authority", () => {
    const output = makeValidOutput({
      authorities: [
        {
          id: "A1",
          title: "Test",
          type: "case",
          citation: "2021 SCC 1",
          jurisdiction: "Canada",
          weight: "binding",
          relevance: "Relevant",
          treatment: "supports",
          verification_status: "unverified",
          quoted_text: null,
        },
      ],
      verification: {
        used_only_provided_and_retrieved_sources: true,
        contains_unverified_points: true,
        unverified_point_count: 1,
        needs_human_legal_review: true,
      },
    });

    const result = validateCopilotOutput(output);
    expect(result.ok).toBe(true);
  });
});

// === Mode enforcement ===

describe("mode-specific enforcement", () => {
  it("warns draft_factum without draft_output", () => {
    const output = makeValidOutput({
      mode: "draft_factum",
      draft_output: undefined,
    });

    const result = validateCopilotOutput(output);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(
        result.warnings.some((w) => w.code === "MISSING_DRAFT_OUTPUT")
      ).toBe(true);
    }
  });

  it("accepts draft_factum with draft_output", () => {
    const output = makeValidOutput({
      mode: "draft_factum",
      draft_output: {
        document_type: "factum_section",
        title: "Argument on Standard of Review",
        body: "The standard of review is reasonableness...",
      },
    });

    const result = validateCopilotOutput(output);
    expect(result.ok).toBe(true);
  });

  it("warns case_comparison without comparison_matrix", () => {
    const output = makeValidOutput({
      mode: "case_comparison",
      comparison_matrix: null,
    });

    const result = validateCopilotOutput(output);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(
        result.warnings.some((w) => w.code === "MISSING_COMPARISON_MATRIX")
      ).toBe(true);
    }
  });

  it("warns case_comparison with empty comparison_matrix", () => {
    const output = makeValidOutput({
      mode: "case_comparison",
      comparison_matrix: [],
    });

    const result = validateCopilotOutput(output);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(
        result.warnings.some((w) => w.code === "MISSING_COMPARISON_MATRIX")
      ).toBe(true);
    }
  });

  it("accepts case_comparison with comparison_matrix", () => {
    const output = makeValidOutput({
      mode: "case_comparison",
      comparison_matrix: [
        {
          point: "Standard of review applied",
          current_matter: "Reasonableness argued",
          authority: "Correctness applied in cited case",
          effect: "mixed",
        },
      ],
    });

    const result = validateCopilotOutput(output);
    expect(result.ok).toBe(true);
  });

  it("accepts memo mode without draft_output or comparison_matrix", () => {
    const result = validateCopilotOutput(makeValidOutput());
    expect(result.ok).toBe(true);
  });
});

// === safeParseModelJson ===

describe("safeParseModelJson", () => {
  it("parses clean JSON", () => {
    const result = safeParseModelJson('{"key": "value"}');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual({ key: "value" });
  });

  it("strips ```json fences", () => {
    const result = safeParseModelJson('```json\n{"key": "value"}\n```');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual({ key: "value" });
  });

  it("strips ``` fences without json label", () => {
    const result = safeParseModelJson('```\n{"key": "value"}\n```');
    expect(result.ok).toBe(true);
  });

  it("handles leading/trailing whitespace", () => {
    const result = safeParseModelJson('  \n{"key": "value"}\n  ');
    expect(result.ok).toBe(true);
  });

  it("returns error for invalid JSON", () => {
    const result = safeParseModelJson("not json at all");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeTruthy();
  });

  it("returns error for empty string", () => {
    const result = safeParseModelJson("");
    expect(result.ok).toBe(false);
  });
});

// === Runtime template ===

describe("buildRuntimePayload", () => {
  it("builds a valid payload with defaults", () => {
    const payload = buildRuntimePayload(makeMinimalRuntimeInput());
    expect(payload.mode).toBe("memo");
    expect(payload.jurisdiction.country).toBe("Canada");
    expect(payload.constraints).toEqual(DEFAULT_CONSTRAINTS);
    expect(payload.style.tone).toBe("professional");
    expect(payload.output_preferences.return_json_only).toBe(true);
  });

  it("prefixes OCR document excerpts with quality warning", () => {
    const input = makeMinimalRuntimeInput();
    input.documents = [
      {
        id: "doc1",
        filename: "scan.jpg",
        document_type: "EVIDENCE",
        extraction_method: "OCR",
        excerpt: "Some extracted text from a photo",
      },
    ];

    const payload = buildRuntimePayload(input);
    expect(payload.documents).toHaveLength(1);
    expect(payload.documents![0].excerpt).toContain(
      "[Note: This text was extracted via OCR and may contain errors.]"
    );
    expect(payload.documents![0].excerpt.startsWith("[Note:")).toBe(true);
  });

  it("does not double-prefix OCR excerpts", () => {
    const input = makeMinimalRuntimeInput();
    input.documents = [
      {
        id: "doc1",
        filename: "scan.jpg",
        document_type: "EVIDENCE",
        extraction_method: "OCR",
        excerpt: "[Note: This text was extracted via OCR and may contain errors.]\nAlready prefixed",
      },
    ];

    const payload = buildRuntimePayload(input);
    const prefixCount = (
      payload.documents![0].excerpt.match(
        /\[Note: This text was extracted via OCR/g
      ) ?? []
    ).length;
    expect(prefixCount).toBe(1);
  });

  it("does not prefix non-OCR documents", () => {
    const input = makeMinimalRuntimeInput();
    input.documents = [
      {
        id: "doc1",
        filename: "brief.pdf",
        document_type: "PLEADING",
        extraction_method: "PDF_PARSE",
        excerpt: "Text from a PDF",
      },
    ];

    const payload = buildRuntimePayload(input);
    expect(payload.documents![0].excerpt).toBe("Text from a PDF");
  });

  it("omits documents key when no documents provided", () => {
    const payload = buildRuntimePayload(makeMinimalRuntimeInput());
    expect(payload.documents).toBeUndefined();
  });

  it("applies constraint overrides", () => {
    const input = makeMinimalRuntimeInput();
    input.constraintOverrides = { allow_numeric_probability: true };

    const payload = buildRuntimePayload(input);
    expect(payload.constraints.allow_numeric_probability).toBe(true);
    expect(payload.constraints.do_not_invent_citations).toBe(true); // unchanged
  });
});

// === Mode registry ===

describe("mode registry", () => {
  it("has exactly 4 modes", () => {
    expect(ANALYSIS_MODE_KEYS).toHaveLength(4);
    expect(ANALYSIS_MODE_KEYS).toContain("memo");
    expect(ANALYSIS_MODE_KEYS).toContain("strategy");
    expect(ANALYSIS_MODE_KEYS).toContain("case_comparison");
    expect(ANALYSIS_MODE_KEYS).toContain("draft_factum");
  });

  it("default mode is memo", () => {
    expect(DEFAULT_MODE).toBe("memo");
  });

  it("getModeConfig returns correct config for each mode", () => {
    for (const key of ANALYSIS_MODE_KEYS) {
      const config = getModeConfig(key);
      expect(config.key).toBe(key);
      expect(config.label).toBeTruthy();
      expect(config.description).toBeTruthy();
      expect(config.instruction).toBeTruthy();
      expect(config.priorities.length).toBeGreaterThan(0);
    }
  });

  it("only draft_factum expects draft output", () => {
    expect(ANALYSIS_MODES.draft_factum.expectsDraftOutput).toBe(true);
    expect(ANALYSIS_MODES.memo.expectsDraftOutput).toBe(false);
    expect(ANALYSIS_MODES.strategy.expectsDraftOutput).toBe(false);
    expect(ANALYSIS_MODES.case_comparison.expectsDraftOutput).toBe(false);
  });

  it("only case_comparison expects comparison matrix", () => {
    expect(ANALYSIS_MODES.case_comparison.expectsComparisonMatrix).toBe(true);
    expect(ANALYSIS_MODES.memo.expectsComparisonMatrix).toBe(false);
    expect(ANALYSIS_MODES.strategy.expectsComparisonMatrix).toBe(false);
    expect(ANALYSIS_MODES.draft_factum.expectsComparisonMatrix).toBe(false);
  });
});

// === System prompt and guardrails ===

describe("system prompt and guardrails", () => {
  it("system prompt version is v1", () => {
    expect(SYSTEM_PROMPT_VERSION).toBe("v1");
  });

  it("system prompt does not contain greeting or user identity", () => {
    expect(LEGAL_COPILOT_SYSTEM_PROMPT).not.toContain("Lawyer01");
    expect(LEGAL_COPILOT_SYSTEM_PROMPT).not.toContain("greet the user");
    expect(LEGAL_COPILOT_SYSTEM_PROMPT).not.toContain("Once you understand your role");
  });

  it("system prompt contains key discipline markers", () => {
    expect(LEGAL_COPILOT_SYSTEM_PROMPT).toContain("must never invent");
    expect(LEGAL_COPILOT_SYSTEM_PROMPT).toContain("provisional analytical point");
    expect(LEGAL_COPILOT_SYSTEM_PROMPT).toContain("Must output valid JSON");
  });

  it("guardrail rules has exactly 10 entries", () => {
    expect(GUARDRAIL_RULES).toHaveLength(10);
  });

  it("default constraints enforce citation safety", () => {
    expect(DEFAULT_CONSTRAINTS.do_not_invent_citations).toBe(true);
    expect(DEFAULT_CONSTRAINTS.quote_only_when_text_available).toBe(true);
    expect(DEFAULT_CONSTRAINTS.allow_numeric_probability).toBe(false);
  });
});

// === Stats computation ===

describe("output stats", () => {
  it("correctly counts mixed verification statuses", () => {
    const output = makeValidOutput({
      authorities: [
        {
          id: "A1",
          title: "Verified",
          type: "case",
          citation: "2021 SCC 1",
          jurisdiction: "Canada",
          weight: "binding",
          relevance: "R",
          treatment: "supports",
          verification_status: "verified",
        },
        {
          id: "A2",
          title: "Provisional",
          type: "case",
          citation: "2022 ONCA 1",
          jurisdiction: "Ontario",
          weight: "persuasive",
          relevance: "R",
          treatment: "supports",
          verification_status: "provisional",
        },
        {
          id: "A3",
          title: "Unverified",
          type: "case",
          citation: "2023 BCSC 1",
          jurisdiction: "BC",
          weight: "uncertain",
          relevance: "R",
          treatment: "background_only",
          verification_status: "unverified",
        },
      ],
      verification: {
        used_only_provided_and_retrieved_sources: true,
        contains_unverified_points: true,
        unverified_point_count: 2,
        needs_human_legal_review: true,
      },
    });

    const result = validateCopilotOutput(output);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.stats.totalAuthorities).toBe(3);
      expect(result.stats.verifiedAuthorities).toBe(1);
      expect(result.stats.provisionalAuthorities).toBe(1);
      expect(result.stats.unverifiedAuthorities).toBe(1);
    }
  });
});
