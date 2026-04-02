/**
 * Types and pure helpers for the intake form system.
 *
 * This module is imported by both client components and server-rendered layouts.
 * Keep it free of React imports and side effects.
 */

export interface Party {
  name: string;
  role: string;
}

export interface KeyDate {
  date: string;
  event: string;
}

export interface AuthorityEntry {
  caseName: string;
  citation: string;
  relevance: string;
}

export interface IntakeFormData {
  // Section 1: Jurisdiction
  province: string;
  courtLevel: string;
  jurisdictionType: string;
  areaOfLaw: string;

  // Section 2: Facts & Parties
  facts: string;
  parties: Party[];

  // Section 3: Legal Objective
  desiredOutcome: string;
  constraints: string;

  // Section 4: Procedural History
  proceduralStage: string;
  priorDecisions: string;
  keyDates: KeyDate[];

  // Section 5: Known Authorities
  supportingAuthorities: AuthorityEntry[];
  opposingArguments: string;
  opposingAuthorities: AuthorityEntry[];
}

export type IntakeSectionKey =
  | "jurisdiction"
  | "facts"
  | "objective"
  | "history"
  | "authorities"
  | "documents";

export interface IntakeSectionDef {
  key: IntakeSectionKey;
  order: number;
  title: string;
  required: boolean;
}

export const INTAKE_SECTION_DEFS: IntakeSectionDef[] = [
  { key: "jurisdiction", order: 1, title: "Jurisdiction & Forum", required: true },
  { key: "facts", order: 2, title: "Facts & Parties", required: true },
  { key: "objective", order: 3, title: "Legal Objective", required: true },
  { key: "history", order: 4, title: "Procedural History", required: false },
  { key: "authorities", order: 5, title: "Known Authorities", required: false },
  { key: "documents", order: 6, title: "Documents", required: false },
];

// === Shared pure helpers ===

/** Strip HTML tags and trim whitespace. */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/** Normalize a string to null if empty/whitespace-only. */
function toNullIfEmpty(value: string | null | undefined): string | null {
  if (value == null) return null;
  return value.trim().length > 0 ? value : null;
}

/**
 * Check if intake has enough data for analysis readiness.
 *
 * Used by both:
 * - Client-side form state (IntakeFormData)
 * - Server-side layout (raw DB fields via IntakeReadinessInput)
 *
 * Requirements:
 * - Province must be a non-empty string
 * - Facts must have >= 10 chars of actual text content (HTML stripped)
 * - Desired outcome must have >= 5 chars
 */
export interface IntakeReadinessInput {
  province: string | null | undefined;
  facts: string | null | undefined;
  desiredOutcome: string | null | undefined;
}

export function isIntakeReady(input: IntakeReadinessInput): boolean {
  const province = (input.province ?? "").trim();
  const facts = stripHtml(input.facts ?? "");
  const outcome = (input.desiredOutcome ?? "").trim();

  return province.length > 0 && facts.length >= 10 && outcome.length >= 5;
}

/** Check if a specific section has meaningful data. */
export function sectionHasData(
  section: IntakeSectionKey,
  data: IntakeFormData
): boolean {
  switch (section) {
    case "jurisdiction":
      return data.province.trim().length > 0;
    case "facts":
      return (
        stripHtml(data.facts).length > 0 ||
        data.parties.some((p) => p.name.trim().length > 0)
      );
    case "objective":
      return data.desiredOutcome.trim().length > 0;
    case "history":
      return (
        data.proceduralStage.trim().length > 0 ||
        data.priorDecisions.trim().length > 0 ||
        data.keyDates.some((d) => d.date.trim().length > 0)
      );
    case "authorities":
      return (
        data.supportingAuthorities.some((a) => a.caseName.trim().length > 0) ||
        data.opposingArguments.trim().length > 0 ||
        data.opposingAuthorities.some((a) => a.caseName.trim().length > 0)
      );
    case "documents":
      return false; // handled by Documents tab
  }
}

// === Normalization helpers ===

/** Filter out empty/whitespace-only party entries. */
export function normalizeParties(parties: Party[]): Party[] {
  return parties
    .map((p) => ({ name: p.name.trim(), role: p.role.trim() }))
    .filter((p) => p.name.length > 0 && p.role.length > 0);
}

/** Filter out empty/whitespace-only key date entries. */
export function normalizeKeyDates(dates: KeyDate[]): KeyDate[] {
  return dates
    .map((d) => ({ date: d.date.trim(), event: d.event.trim() }))
    .filter((d) => d.date.length > 0 && d.event.length > 0);
}

/** Filter out empty/whitespace-only authority entries. */
export function normalizeAuthorities(entries: AuthorityEntry[]): AuthorityEntry[] {
  return entries
    .map((a) => ({
      caseName: a.caseName.trim(),
      citation: a.citation.trim(),
      relevance: a.relevance.trim(),
    }))
    .filter((a) => a.caseName.length > 0 && a.citation.length > 0);
}

/**
 * Extract and normalize section-specific data for saving.
 * Returns null for empty strings, filters empty list items.
 */
export function extractSectionData(
  section: IntakeSectionKey,
  data: IntakeFormData
): Record<string, unknown> {
  switch (section) {
    case "jurisdiction":
      return {
        province: toNullIfEmpty(data.province),
        courtLevel: toNullIfEmpty(data.courtLevel),
        jurisdictionType: toNullIfEmpty(data.jurisdictionType),
        areaOfLaw: toNullIfEmpty(data.areaOfLaw),
      };
    case "facts": {
      const parties = normalizeParties(data.parties);
      return {
        facts: toNullIfEmpty(data.facts),
        parties: parties.length > 0 ? parties : null,
      };
    }
    case "objective":
      return {
        desiredOutcome: toNullIfEmpty(data.desiredOutcome),
        constraints: toNullIfEmpty(data.constraints),
      };
    case "history": {
      const keyDates = normalizeKeyDates(data.keyDates);
      return {
        proceduralStage: toNullIfEmpty(data.proceduralStage),
        priorDecisions: toNullIfEmpty(data.priorDecisions),
        keyDates: keyDates.length > 0 ? keyDates : null,
      };
    }
    case "authorities": {
      const supporting = normalizeAuthorities(data.supportingAuthorities);
      const opposing = normalizeAuthorities(data.opposingAuthorities);
      return {
        supportingAuthorities: supporting.length > 0 ? supporting : null,
        opposingArguments: toNullIfEmpty(data.opposingArguments),
        opposingAuthorities: opposing.length > 0 ? opposing : null,
      };
    }
    case "documents":
      return {};
  }
}
