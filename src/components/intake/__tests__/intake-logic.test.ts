/**
 * Tests for intake pure helpers: readiness, sectionHasData, normalization, extractSectionData.
 */

import {
  isIntakeReady,
  sectionHasData,
  normalizeParties,
  normalizeKeyDates,
  normalizeAuthorities,
  extractSectionData,
  stripHtml,
  type IntakeFormData,
} from "../intake-types";

// === Fixtures ===

function makeEmptyFormData(): IntakeFormData {
  return {
    province: "",
    courtLevel: "",
    jurisdictionType: "",
    areaOfLaw: "",
    facts: "",
    parties: [],
    desiredOutcome: "",
    constraints: "",
    proceduralStage: "",
    priorDecisions: "",
    keyDates: [],
    supportingAuthorities: [],
    opposingArguments: "",
    opposingAuthorities: [],
  };
}

function makeReadyFormData(): IntakeFormData {
  return {
    ...makeEmptyFormData(),
    province: "Ontario",
    facts: "The applicant was terminated without cause on March 14, 2026.",
    desiredOutcome: "Obtain judicial review of the decision",
  };
}

// === stripHtml ===

describe("stripHtml", () => {
  it("strips HTML tags and trims", () => {
    expect(stripHtml("<p>Hello <strong>world</strong></p>")).toBe("Hello world");
  });

  it("handles plain text", () => {
    expect(stripHtml("plain text")).toBe("plain text");
  });

  it("returns empty for tags-only content", () => {
    expect(stripHtml("<p><br></p>")).toBe("");
  });

  it("returns empty for whitespace-in-tags", () => {
    expect(stripHtml("<p>   </p>")).toBe("");
  });
});

// === isIntakeReady ===

describe("isIntakeReady", () => {
  it("returns true when all 3 required sections have content", () => {
    expect(isIntakeReady(makeReadyFormData())).toBe(true);
  });

  it("returns false with empty form", () => {
    expect(isIntakeReady(makeEmptyFormData())).toBe(false);
  });

  it("returns false when province is missing", () => {
    expect(isIntakeReady({ ...makeReadyFormData(), province: "" })).toBe(false);
  });

  it("returns false when province is whitespace only", () => {
    expect(isIntakeReady({ ...makeReadyFormData(), province: "   " })).toBe(false);
  });

  it("returns false when facts are too short", () => {
    expect(isIntakeReady({ ...makeReadyFormData(), facts: "Short" })).toBe(false);
  });

  it("returns false when facts are whitespace only", () => {
    expect(isIntakeReady({ ...makeReadyFormData(), facts: "         " })).toBe(false);
  });

  it("returns false when facts are HTML-only with no text", () => {
    expect(isIntakeReady({ ...makeReadyFormData(), facts: "<p><br></p>" })).toBe(false);
  });

  it("handles HTML facts with enough text content", () => {
    expect(
      isIntakeReady({
        ...makeReadyFormData(),
        facts: "<p>The applicant was terminated without cause on March 14.</p>",
      })
    ).toBe(true);
  });

  it("returns false when desired outcome is too short", () => {
    expect(isIntakeReady({ ...makeReadyFormData(), desiredOutcome: "Go" })).toBe(false);
  });

  it("returns false when desired outcome is whitespace only", () => {
    expect(isIntakeReady({ ...makeReadyFormData(), desiredOutcome: "     " })).toBe(false);
  });

  it("works with nullable inputs (server-side usage)", () => {
    expect(isIntakeReady({ province: null, facts: null, desiredOutcome: null })).toBe(false);
    expect(isIntakeReady({ province: undefined, facts: undefined, desiredOutcome: undefined })).toBe(false);
    expect(
      isIntakeReady({
        province: "Ontario",
        facts: "Enough text content for the minimum check here",
        desiredOutcome: "Obtain relief",
      })
    ).toBe(true);
  });
});

// === sectionHasData ===

describe("sectionHasData", () => {
  it("jurisdiction: false when empty", () => {
    expect(sectionHasData("jurisdiction", makeEmptyFormData())).toBe(false);
  });

  it("jurisdiction: true when province set", () => {
    expect(sectionHasData("jurisdiction", { ...makeEmptyFormData(), province: "BC" })).toBe(true);
  });

  it("jurisdiction: false when province is whitespace", () => {
    expect(sectionHasData("jurisdiction", { ...makeEmptyFormData(), province: "   " })).toBe(false);
  });

  it("facts: true when facts have text", () => {
    expect(sectionHasData("facts", { ...makeEmptyFormData(), facts: "Some facts" })).toBe(true);
  });

  it("facts: true when parties exist with real names", () => {
    expect(
      sectionHasData("facts", {
        ...makeEmptyFormData(),
        parties: [{ name: "Smith", role: "Plaintiff" }],
      })
    ).toBe(true);
  });

  it("facts: false when parties have only whitespace names", () => {
    expect(
      sectionHasData("facts", {
        ...makeEmptyFormData(),
        parties: [{ name: "  ", role: "Plaintiff" }],
      })
    ).toBe(false);
  });

  it("objective: false when whitespace only", () => {
    expect(sectionHasData("objective", { ...makeEmptyFormData(), desiredOutcome: "   " })).toBe(false);
  });

  it("history: true when key dates exist with content", () => {
    expect(
      sectionHasData("history", {
        ...makeEmptyFormData(),
        keyDates: [{ date: "2026-03-14", event: "Filing" }],
      })
    ).toBe(true);
  });

  it("history: false when key dates have empty date", () => {
    expect(
      sectionHasData("history", {
        ...makeEmptyFormData(),
        keyDates: [{ date: "  ", event: "Filing" }],
      })
    ).toBe(false);
  });

  it("authorities: true when supporting authority has real name", () => {
    expect(
      sectionHasData("authorities", {
        ...makeEmptyFormData(),
        supportingAuthorities: [{ caseName: "Test Case", citation: "2021 SCC 1", relevance: "" }],
      })
    ).toBe(true);
  });

  it("authorities: false when authority name is whitespace", () => {
    expect(
      sectionHasData("authorities", {
        ...makeEmptyFormData(),
        supportingAuthorities: [{ caseName: "  ", citation: "2021 SCC 1", relevance: "" }],
      })
    ).toBe(false);
  });

  it("documents: always false", () => {
    expect(sectionHasData("documents", makeReadyFormData())).toBe(false);
  });
});

// === normalizeParties ===

describe("normalizeParties", () => {
  it("keeps valid entries", () => {
    const result = normalizeParties([{ name: "Smith", role: "Plaintiff" }]);
    expect(result).toEqual([{ name: "Smith", role: "Plaintiff" }]);
  });

  it("trims whitespace", () => {
    const result = normalizeParties([{ name: "  Smith  ", role: "  Plaintiff  " }]);
    expect(result).toEqual([{ name: "Smith", role: "Plaintiff" }]);
  });

  it("removes entries with empty name", () => {
    const result = normalizeParties([
      { name: "", role: "Plaintiff" },
      { name: "Smith", role: "Defendant" },
    ]);
    expect(result).toEqual([{ name: "Smith", role: "Defendant" }]);
  });

  it("removes entries with whitespace-only name", () => {
    const result = normalizeParties([{ name: "   ", role: "Plaintiff" }]);
    expect(result).toEqual([]);
  });

  it("removes entries with empty role", () => {
    const result = normalizeParties([{ name: "Smith", role: "" }]);
    expect(result).toEqual([]);
  });
});

// === normalizeKeyDates ===

describe("normalizeKeyDates", () => {
  it("keeps valid entries", () => {
    const result = normalizeKeyDates([{ date: "2026-03-14", event: "Filed" }]);
    expect(result).toEqual([{ date: "2026-03-14", event: "Filed" }]);
  });

  it("removes entries with empty date", () => {
    const result = normalizeKeyDates([{ date: "", event: "Filed" }]);
    expect(result).toEqual([]);
  });

  it("removes entries with whitespace-only event", () => {
    const result = normalizeKeyDates([{ date: "2026-03-14", event: "   " }]);
    expect(result).toEqual([]);
  });
});

// === normalizeAuthorities ===

describe("normalizeAuthorities", () => {
  it("keeps valid entries", () => {
    const result = normalizeAuthorities([
      { caseName: "Test Case", citation: "2021 SCC 1", relevance: "Key holding" },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].caseName).toBe("Test Case");
  });

  it("removes entries with empty caseName", () => {
    const result = normalizeAuthorities([
      { caseName: "", citation: "2021 SCC 1", relevance: "" },
    ]);
    expect(result).toEqual([]);
  });

  it("removes entries with empty citation", () => {
    const result = normalizeAuthorities([
      { caseName: "Test", citation: "  ", relevance: "" },
    ]);
    expect(result).toEqual([]);
  });

  it("keeps entries with empty relevance (optional)", () => {
    const result = normalizeAuthorities([
      { caseName: "Test", citation: "2021 SCC 1", relevance: "" },
    ]);
    expect(result).toHaveLength(1);
  });
});

// === extractSectionData ===

describe("extractSectionData", () => {
  it("jurisdiction: nullifies empty strings", () => {
    const data = makeEmptyFormData();
    const result = extractSectionData("jurisdiction", data);
    expect(result.province).toBeNull();
    expect(result.courtLevel).toBeNull();
  });

  it("jurisdiction: preserves non-empty values", () => {
    const data = { ...makeEmptyFormData(), province: "Ontario" };
    const result = extractSectionData("jurisdiction", data);
    expect(result.province).toBe("Ontario");
  });

  it("facts: normalizes parties, removes empty items", () => {
    const data = {
      ...makeEmptyFormData(),
      facts: "Some facts",
      parties: [
        { name: "Smith", role: "Plaintiff" },
        { name: "  ", role: "Defendant" },
      ],
    };
    const result = extractSectionData("facts", data);
    expect(result.facts).toBe("Some facts");
    expect(result.parties).toEqual([{ name: "Smith", role: "Plaintiff" }]);
  });

  it("facts: nullifies parties when all are empty", () => {
    const data = {
      ...makeEmptyFormData(),
      parties: [{ name: "  ", role: "  " }],
    };
    const result = extractSectionData("facts", data);
    expect(result.parties).toBeNull();
  });

  it("authorities: normalizes and nullifies empty lists", () => {
    const data = {
      ...makeEmptyFormData(),
      supportingAuthorities: [{ caseName: " ", citation: " ", relevance: "" }],
      opposingAuthorities: [],
    };
    const result = extractSectionData("authorities", data);
    expect(result.supportingAuthorities).toBeNull();
    expect(result.opposingAuthorities).toBeNull();
  });

  it("documents: returns empty object", () => {
    expect(extractSectionData("documents", makeEmptyFormData())).toEqual({});
  });
});
