// === Enums ===
// These mirror the Prisma schema enums. Keep in sync.

export const MATTER_TYPES = ["LITIGATION", "REGULATORY", "ADVISORY", "OTHER"] as const;
export type MatterType = (typeof MATTER_TYPES)[number];

export const MATTER_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
export type MatterStatus = (typeof MATTER_STATUSES)[number];

export const DOCUMENT_TYPES = [
  "PLEADING",
  "EVIDENCE",
  "CASE_LAW",
  "STATUTE",
  "CORRESPONDENCE",
  "OTHER",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const EXTRACTION_STATUSES = ["PENDING", "PROCESSING", "COMPLETE", "FAILED"] as const;
export type ExtractionStatus = (typeof EXTRACTION_STATUSES)[number];

export const ANALYSIS_RUN_STATUSES = ["RUNNING", "COMPLETE", "FAILED"] as const;
export type AnalysisRunStatus = (typeof ANALYSIS_RUN_STATUSES)[number];

export const REVIEW_STATUSES = ["UNREVIEWED", "REVIEWED", "FLAGGED"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const CITATION_SOURCES = ["AI_GENERATED", "USER_PROVIDED"] as const;
export type CitationSource = (typeof CITATION_SOURCES)[number];

export const VERIFICATION_STATUSES = ["UNVERIFIED", "VERIFIED", "FLAGGED"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

// === Analysis Sections ===

export const ANALYSIS_SECTIONS = [
  { key: "executive_assessment", order: 1, title: "Executive Assessment" },
  { key: "issues_to_decide", order: 2, title: "Issues to Decide" },
  { key: "governing_law", order: 3, title: "Governing Law" },
  { key: "application_to_facts", order: 4, title: "Application to the Facts" },
  { key: "arguments_for", order: 5, title: "Strongest Arguments in Favour" },
  { key: "counterarguments", order: 6, title: "Best Counterarguments and Rebuttals" },
  { key: "procedural_strategy", order: 7, title: "Procedural Strategy" },
  { key: "authority_map", order: 8, title: "Authority Map" },
  { key: "risk_analysis", order: 9, title: "Risk Analysis" },
  { key: "work_product", order: 10, title: "Draft Advocacy Points / Work-Product Support" },
] as const;

// === Intake Sections ===

export const INTAKE_SECTIONS = [
  { key: "jurisdiction", order: 1, title: "Jurisdiction & Forum", required: true },
  { key: "facts_parties", order: 2, title: "Facts & Parties", required: true },
  { key: "legal_objective", order: 3, title: "Legal Objective", required: true },
  { key: "procedural_history", order: 4, title: "Procedural History", required: false },
  { key: "known_authorities", order: 5, title: "Known Authorities", required: false },
  { key: "documents", order: 6, title: "Documents", required: false },
] as const;

// === Validation Limits ===

export const MAX_FACT_NARRATIVE_LENGTH = 5000;
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
export const MAX_FILES_PER_MATTER = 5;
export const MAX_DOC_EXCERPT_CHARS = 3000;
export const MAX_DOCS_IN_PROMPT = 5;

// === File Upload ===

export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".txt",
  ".jpg",
  ".jpeg",
  ".png",
  ".heic",
  ".heif",
] as const;

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
] as const;

// === Canadian Jurisdictions ===

export const PROVINCES = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon",
  "Federal",
] as const;

export const COURT_LEVELS = [
  "Superior Court",
  "Court of Appeal",
  "Provincial Court",
  "Supreme Court of Canada",
  "Federal Court",
  "Federal Court of Appeal",
  "Tax Court",
  "Tribunal",
  "Other",
] as const;

export const AREAS_OF_LAW = [
  "Administrative Law",
  "Banking & Finance",
  "Bankruptcy & Insolvency",
  "Charter Rights",
  "Civil Procedure",
  "Commercial Law",
  "Constitutional Law",
  "Construction Law",
  "Contract Law",
  "Criminal Law",
  "Employment Law",
  "Environmental Law",
  "Family Law",
  "Health Law",
  "Human Rights",
  "Immigration",
  "Indigenous Law",
  "Insurance Law",
  "Intellectual Property",
  "International Trade",
  "Labour Law",
  "Municipal Law",
  "Personal Injury",
  "Privacy Law",
  "Professional Negligence",
  "Property Law",
  "Real Estate",
  "Regulatory",
  "Securities",
  "Tax Law",
  "Tort Law",
  "Wills & Estates",
  "Other",
] as const;
