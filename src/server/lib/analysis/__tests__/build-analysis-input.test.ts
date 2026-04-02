/**
 * Tests for analysis input building logic.
 */

import { buildAnalysisInput } from "../build-analysis-input";
import type { MatterIntake } from "@prisma/client";

function makeMinimalIntake(
  overrides?: Partial<MatterIntake>
): MatterIntake {
  return {
    id: "intake-1",
    matterId: "matter-1",
    province: "Ontario",
    courtLevel: "Superior Court",
    jurisdictionType: "provincial",
    areaOfLaw: "Administrative Law",
    facts: "The applicant was terminated without cause on March 14, 2026, after 15 years of service.",
    parties: [
      { name: "Smith", role: "Applicant" },
      { name: "Corp Inc", role: "Respondent" },
    ],
    desiredOutcome: "Obtain judicial review and reinstatement",
    constraints: null,
    proceduralStage: "Pre-application",
    priorDecisions: null,
    keyDates: null,
    supportingAuthorities: null,
    opposingArguments: null,
    opposingAuthorities: null,
    updatedAt: new Date(),
    ...overrides,
  } as MatterIntake;
}

describe("buildAnalysisInput", () => {
  it("succeeds with minimal valid intake", () => {
    const result = buildAnalysisInput({
      mode: "memo",
      matterId: "matter-1",
      matterTitle: "Test Matter",
      intake: makeMinimalIntake(),
      documents: [],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.mode).toBe("memo");
      expect(result.payload.jurisdiction.province_or_territory).toBe("Ontario");
      expect(result.hasOcrDocuments).toBe(false);
      expect(result.documentExcerpts).toHaveLength(0);
    }
  });

  it("fails when province is missing", () => {
    const result = buildAnalysisInput({
      mode: "memo",
      matterId: "matter-1",
      matterTitle: "Test",
      intake: makeMinimalIntake({ province: null }),
      documents: [],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("province");
    }
  });

  it("fails when facts are too short", () => {
    const result = buildAnalysisInput({
      mode: "memo",
      matterId: "matter-1",
      matterTitle: "Test",
      intake: makeMinimalIntake({ facts: "Short" }),
      documents: [],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("too short");
    }
  });

  it("fails when desired outcome is missing", () => {
    const result = buildAnalysisInput({
      mode: "memo",
      matterId: "matter-1",
      matterTitle: "Test",
      intake: makeMinimalIntake({ desiredOutcome: "" }),
      documents: [],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("outcome");
    }
  });

  it("includes only documents with includeInAnalysis=true and usable text", () => {
    const docs = [
      {
        id: "doc-1",
        originalFilename: "included.pdf",
        documentType: "PLEADING" as const,
        extractionMethod: "PDF_PARSE" as const,
        extractionStatus: "COMPLETE" as const,
        extractedText: "This is extracted text from the document.",
        includeInAnalysis: true,
      },
      {
        id: "doc-2",
        originalFilename: "excluded.pdf",
        documentType: "EVIDENCE" as const,
        extractionMethod: "PDF_PARSE" as const,
        extractionStatus: "COMPLETE" as const,
        extractedText: "This text is excluded by user choice.",
        includeInAnalysis: false,
      },
      {
        id: "doc-3",
        originalFilename: "failed.pdf",
        documentType: "OTHER" as const,
        extractionMethod: null,
        extractionStatus: "FAILED" as const,
        extractedText: null,
        includeInAnalysis: true,
      },
      {
        id: "doc-4",
        originalFilename: "empty.pdf",
        documentType: "OTHER" as const,
        extractionMethod: "PDF_PARSE" as const,
        extractionStatus: "COMPLETE" as const,
        extractedText: "   ",
        includeInAnalysis: true,
      },
    ];

    const result = buildAnalysisInput({
      mode: "memo",
      matterId: "matter-1",
      matterTitle: "Test",
      intake: makeMinimalIntake(),
      documents: docs,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.documentExcerpts).toHaveLength(1);
      expect(result.documentExcerpts[0].filename).toBe("included.pdf");
    }
  });

  it("detects OCR documents", () => {
    const docs = [
      {
        id: "doc-1",
        originalFilename: "scan.jpg",
        documentType: "EVIDENCE" as const,
        extractionMethod: "OCR" as const,
        extractionStatus: "COMPLETE" as const,
        extractedText: "OCR text from scanned document that is long enough.",
        includeInAnalysis: true,
      },
    ];

    const result = buildAnalysisInput({
      mode: "memo",
      matterId: "matter-1",
      matterTitle: "Test",
      intake: makeMinimalIntake(),
      documents: docs,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.hasOcrDocuments).toBe(true);
    }
  });

  it("sets civil_law for Quebec", () => {
    const result = buildAnalysisInput({
      mode: "memo",
      matterId: "matter-1",
      matterTitle: "Test",
      intake: makeMinimalIntake({ province: "Quebec" }),
      documents: [],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.jurisdiction.legal_system).toBe("civil_law");
    }
  });

  it("includes user-provided authorities", () => {
    const result = buildAnalysisInput({
      mode: "memo",
      matterId: "matter-1",
      matterTitle: "Test",
      intake: makeMinimalIntake({
        supportingAuthorities: [
          { caseName: "Test Case", citation: "2021 SCC 1", relevance: "Key" },
        ],
      }),
      documents: [],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.authorities.provided_authorities).toHaveLength(1);
      expect(result.payload.authorities.provided_authorities[0].title).toBe(
        "Test Case"
      );
    }
  });

  it("stores input snapshot for traceability", () => {
    const result = buildAnalysisInput({
      mode: "strategy",
      matterId: "matter-1",
      matterTitle: "Test",
      intake: makeMinimalIntake(),
      documents: [],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.inputSnapshot).toHaveProperty("province", "Ontario");
      expect(result.inputSnapshot).toHaveProperty("areaOfLaw", "Administrative Law");
    }
  });
});
