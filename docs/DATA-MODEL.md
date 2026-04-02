# Data Model

## Entity Relationship

```
User (1) ──→ (many) Matter
Matter (1) ──→ (1) MatterIntake
Matter (1) ──→ (many) Document
Matter (1) ──→ (many) AnalysisRun
AnalysisRun (1) ──→ (many) AnalysisSection
AnalysisRun (1) ──→ (many) Citation
AnalysisSection (1) ──→ (many) Citation
```

## Entities

### User

| Field        | Type     | Notes            |
| ------------ | -------- | ---------------- |
| id           | UUID     | PK               |
| email        | String   | Unique           |
| passwordHash | String   | bcrypt 12 rounds |
| name         | String   | Display name     |
| createdAt    | DateTime |                  |

Single-user pilot. No roles, no orgs.

### Matter

| Field      | Type     | Notes                                       |
| ---------- | -------- | ------------------------------------------- |
| id         | UUID     | PK                                          |
| userId     | UUID     | FK → User. **Every query filters on this.** |
| title      | String   |                                             |
| matterType | Enum     | LITIGATION, REGULATORY, ADVISORY, OTHER     |
| status     | Enum     | DRAFT, ACTIVE, ARCHIVED                     |
| createdAt  | DateTime |                                             |
| updatedAt  | DateTime |                                             |

### MatterIntake

| Field                 | Type     | Notes                                        |
| --------------------- | -------- | -------------------------------------------- |
| id                    | UUID     | PK                                           |
| matterId              | UUID     | FK → Matter (unique, 1:1)                    |
| jurisdiction          | JSON     | `{ province, courtLevel, jurisdictionType }` |
| areaOfLaw             | String   |                                              |
| facts                 | Text     | Rich text (Tiptap)                           |
| parties               | JSON     | `[{ name, role }]`                           |
| desiredOutcome        | Text     |                                              |
| constraints           | Text?    | Optional                                     |
| proceduralStage       | String?  |                                              |
| priorDecisions        | Text?    |                                              |
| keyDates              | JSON?    | `[{ date, event }]`                          |
| supportingAuthorities | JSON?    | `[{ caseName, citation, relevance }]`        |
| opposingArguments     | Text?    |                                              |
| opposingAuthorities   | JSON?    | `[{ caseName, citation, relevance }]`        |
| updatedAt             | DateTime |                                              |

**Intake sections:**

1. **Jurisdiction & Forum** (required): province, courtLevel, jurisdictionType, areaOfLaw
2. **Facts & Parties** (required): facts, parties
3. **Legal Objective** (required): desiredOutcome, constraints
4. **Procedural History** (optional): proceduralStage, priorDecisions, keyDates
5. **Known Authorities** (optional): supportingAuthorities, opposingArguments, opposingAuthorities
6. **Documents** (optional): managed via Document entity

### Document

| Field            | Type     | Notes                                        |
| ---------------- | -------- | -------------------------------------------- |
| id               | UUID     | PK                                           |
| matterId         | UUID     | FK → Matter                                  |
| userId           | UUID     | FK → User                                    |
| originalFilename | String   | Display only — not used for storage          |
| storagePath      | String   | UUID-based path on local FS                  |
| mimeType         | String   | Validated server-side                        |
| fileSize         | Int      | Bytes                                        |
| documentType     | Enum     | PLEADING, EVIDENCE, CASE_LAW, STATUTE, OTHER |
| extractedText    | Text?    | Null until extraction completes              |
| extractionStatus | Enum     | PENDING, COMPLETE, FAILED                    |
| uploadedAt       | DateTime |                                              |

### AnalysisRun

| Field            | Type      | Notes                                  |
| ---------------- | --------- | -------------------------------------- |
| id               | UUID      | PK                                     |
| matterId         | UUID      | FK → Matter                            |
| userId           | UUID      | FK → User                              |
| runNumber        | Int       | Sequential per matter                  |
| status           | Enum      | RUNNING, COMPLETE, FAILED              |
| inputSnapshot    | JSON      | Full intake data at time of run        |
| documentExcerpts | JSON      | Document IDs + truncated text included |
| rawOutput        | Text      | Full model response, unmodified        |
| promptVersion    | String    | e.g., "v1"                             |
| model            | String    | e.g., "gpt-4o"                         |
| inputTokens      | Int       |                                        |
| outputTokens     | Int       |                                        |
| latencyMs        | Int       |                                        |
| startedAt        | DateTime  |                                        |
| completedAt      | DateTime? |                                        |

**Traceability:** Every run stores the exact intake snapshot and document excerpts used. The raw output is preserved. Any analysis can be fully reconstructed.

### AnalysisSection

| Field        | Type   | Notes                                         |
| ------------ | ------ | --------------------------------------------- |
| id           | UUID   | PK                                            |
| runId        | UUID   | FK → AnalysisRun                              |
| sectionKey   | String | e.g., `executive_assessment`, `governing_law` |
| sectionOrder | Int    | 1-10                                          |
| title        | String | Display heading                               |
| summary      | Text   | 2-3 sentence summary                          |
| content      | Text   | Full section content                          |
| reviewStatus | Enum   | UNREVIEWED, REVIEWED, FLAGGED                 |

### Citation

| Field              | Type    | Notes                         |
| ------------------ | ------- | ----------------------------- |
| id                 | UUID    | PK                            |
| runId              | UUID    | FK → AnalysisRun              |
| sectionId          | UUID    | FK → AnalysisSection          |
| citationText       | String  | Full citation string          |
| caseName           | String? | Parsed case name              |
| year               | Int?    | Parsed year                   |
| court              | String? | Parsed court                  |
| propositionUsedFor | Text?   | What legal point it supports  |
| source             | Enum    | AI_GENERATED, USER_PROVIDED   |
| verificationStatus | Enum    | UNVERIFIED, VERIFIED, FLAGGED |

## Deferred Entities

| Entity                    | Why Deferred                           |
| ------------------------- | -------------------------------------- |
| Organization / Membership | No multi-user in pilot                 |
| PromptVersion (DB entity) | Version in code, string on AnalysisRun |
| RefinementThread          | No chat in pilot                       |
| ExportArtifact            | Generate on-demand, don't persist      |
| AuditEvent (DB entity)    | Log to stdout for pilot                |

## Enums

```typescript
enum MatterType {
  LITIGATION,
  REGULATORY,
  ADVISORY,
  OTHER,
}
enum MatterStatus {
  DRAFT,
  ACTIVE,
  ARCHIVED,
}
enum DocumentType {
  PLEADING,
  EVIDENCE,
  CASE_LAW,
  STATUTE,
  OTHER,
}
enum ExtractionStatus {
  PENDING,
  COMPLETE,
  FAILED,
}
enum AnalysisRunStatus {
  RUNNING,
  COMPLETE,
  FAILED,
}
enum ReviewStatus {
  UNREVIEWED,
  REVIEWED,
  FLAGGED,
}
enum CitationSource {
  AI_GENERATED,
  USER_PROVIDED,
}
enum VerificationStatus {
  UNVERIFIED,
  VERIFIED,
  FLAGGED,
}
```

## Key Constraints

- **userId scoping:** Every query that touches user data includes userId. Non-negotiable.
- **Matter-intake 1:1:** One intake per matter. Created when matter is created.
- **Cascade deletes:** Archiving a matter soft-deletes (status change). Hard delete cascades to intake, documents, runs, sections, citations.
- **Transaction boundaries:** Creating an analysis run (run + sections + citations) must be a single transaction.
