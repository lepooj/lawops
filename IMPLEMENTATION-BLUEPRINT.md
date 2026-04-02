# LawOps — Implementation Blueprint

**Date:** 2026-04-01  
**Phase:** Build-Ready  
**Repo:** lepooj/lawops  
**Source of Truth:** PILOT-PLAN.md

---

## 1. Final Scope Lock

### In Scope

| Feature                                     | Notes                                                              |
| ------------------------------------------- | ------------------------------------------------------------------ |
| Auth (email/password, pre-created accounts) | NextAuth v5, credentials provider, bcrypt                          |
| Matter CRUD (create, list, open, archive)   | Status lifecycle: DRAFT → ACTIVE → ARCHIVED                        |
| 6-section structured intake with auto-save  | 3 required (Jurisdiction, Facts, Objective), 3 optional            |
| Document upload: PDF, DOCX, TXT             | Text extraction via pdf-parse + mammoth                            |
| **Document photo upload: JPG, PNG, HEIC**   | **OCR via Tesseract.js. Labeled as OCR-derived. Quality warning.** |
| Per-document "include in analysis" toggle   | User explicitly chooses which docs feed the AI                     |
| Extraction/OCR quality indicators           | Clear status: extracted / OCR (may contain errors) / failed        |
| AI analysis generation (GPT-5.4)            | Single-call, structured prompt, 10-section output                  |
| Structured analysis viewer with TOC         | Collapsible sections, serif legal font, summary + detail           |
| Citation extraction with provenance labels  | 4 states: USER_PROVIDED / UNVERIFIED / VERIFIED / FLAGGED          |
| Per-section review status                   | 3 states: UNREVIEWED / REVIEWED / FLAGGED                          |
| PDF export with legal memo formatting       | Watermark, footnotes, review warnings                              |
| Persistent trust messaging                  | Footer disclaimer, export warnings, honest confidence labels       |
| Seed data (1 complete matter)               | For immediate exploration on first login                           |

### Explicitly Out of Scope

| Feature                                | Status                              |
| -------------------------------------- | ----------------------------------- |
| Multi-user / teams / orgs / RBAC       | Deferred                            |
| 2FA / TOTP                             | Deferred                            |
| CanLII auto-verification               | Deferred                            |
| Follow-up chat / Q&A / refinement      | Deferred                            |
| DOCX export                            | Deferred                            |
| Background job queue                   | Not needed — all processing inline  |
| Admin panel / settings UI              | Hardcode defaults                   |
| Mobile responsive                      | Desktop only                        |
| Document preview in-app                | Show filename + status only         |
| Document versioning                    | Deferred                            |
| Analysis run comparison / diff         | Deferred                            |
| OCR language detection                 | English only                        |
| Image enhancement / pre-processing     | Accept as-is, report quality        |
| Visual document reasoning / GPT vision | Not using — OCR to text only        |
| "Chat with documents"                  | No                                  |
| Registration flow                      | Pre-create accounts via seed script |
| Password reset UI                      | Handle manually for pilot           |

---

## 2. Final User Workflow

### Complete End-to-End

```
1. SIGN IN
   Open app → login page → email + password → dashboard

2. CREATE MATTER
   Dashboard → [+ New Matter] → title + type → matter workspace (Intake tab)

3. FILL STRUCTURED INTAKE
   6-section form, 3 required:
   ① Jurisdiction & Forum (required)
   ② Facts & Parties (required)
   ③ Legal Objective (required)
   ④ Procedural History (optional)
   ⑤ Known Authorities (optional)
   ⑥ Documents (optional)
   Auto-saves on field blur. Progress rail shows completion.

4. UPLOAD DOCUMENTS + PHOTOS
   Documents tab (or section 6 of intake):
   Drop files → system processes:
   - PDF/DOCX/TXT → text extraction → status: "✓ Extracted"
   - JPG/PNG/HEIC → OCR → status: "✓ OCR extracted (may contain errors)"
   - Any failure → status: "⚠ Extraction failed"

   Each document row shows:
   [filename] [type badge] [extraction status] [include in analysis toggle] [delete]

   The "include in analysis" toggle defaults to ON for successful extractions,
   OFF for failed extractions. User can override either way.

5. RUN ANALYSIS
   [Run Analysis] button active when 3 required intake sections complete.
   Click → confirmation modal shows:
   - "Generate analysis from your intake?"
   - Lists which documents will be included (those with toggle ON)
   - "Documents marked with OCR may contain extraction errors."
   - [Generate] [Cancel]

   Staged progress UI during 30-90 second wait.
   On complete → auto-switch to Analysis tab.

6. REVIEW STRUCTURED OUTPUT
   10 sections with sticky TOC. Each section:
   - 2-sentence summary (always visible)
   - Expandable detail (serif font)
   - Inline citation markers (superscript, clickable)
   - Review dropdown: [Unreviewed ▾]

   TOC shows: "3 of 10 sections reviewed"

7. INSPECT AUTHORITIES
   Click citation marker → slide-over panel:
   - Full citation, court, year
   - Provenance: AI-GENERATED or USER_PROVIDED
   - Verification: UNVERIFIED (default) / VERIFIED / FLAGGED
   - Proposition it supports
   - [Mark Verified] [Flag] buttons

8. MARK REVIEW STATE
   Per-section dropdown: Unreviewed → Reviewed ✓ → Flagged ⚠
   Per-citation buttons: Mark Verified / Flag
   Progress tracked in TOC.

9. EXPORT PDF
   [Export] → modal:
   - Section checkboxes (all selected by default)
   - Warning if unreviewed sections exist
   - [Generate PDF] → download

   PDF includes: header, sections, authority footnotes,
   review status labels, "AI-ASSISTED DRAFT" watermark.
```

---

## 3. Final Technical Decisions

| Decision             | Answer                                                             | Locked |
| -------------------- | ------------------------------------------------------------------ | ------ |
| Frontend framework   | Next.js 15 (App Router) + React 19 + TypeScript                    | ✓      |
| Styling              | Tailwind CSS v4 + Radix UI                                         | ✓      |
| Rich text input      | Tiptap (ProseMirror)                                               | ✓      |
| Form handling        | React Hook Form + Zod                                              | ✓      |
| Database             | PostgreSQL 17 + Prisma ORM                                         | ✓      |
| Auth                 | NextAuth v5, credentials provider                                  | ✓      |
| File storage         | Local filesystem `./data/uploads/{matterId}/{uuid}.{ext}`          | ✓      |
| PDF text extraction  | `pdf-parse`                                                        | ✓      |
| DOCX text extraction | `mammoth`                                                          | ✓      |
| Image OCR            | `tesseract.js` (runs in Node, no native deps, no external service) | ✓      |
| HEIC handling        | `heic-convert` to JPEG before OCR                                  | ✓      |
| AI provider          | OpenAI GPT-5.4 via `openai` npm package                            | ✓      |
| PDF export           | `@react-pdf/renderer`                                              | ✓      |
| Deployment           | Docker Compose (Next.js + PostgreSQL)                              | ✓      |
| Background jobs      | None. All inline async/await.                                      | ✓      |
| Fonts                | Inter (UI) + Source Serif 4 (legal content)                        | ✓      |
| Theme                | Dark only                                                          | ✓      |
| Min viewport         | 1280px                                                             | ✓      |

---

## 4. App Structure

```
lawops/
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.css                    # Tailwind v4 CSS-first config
├── next.config.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                     # Demo user + 1-2 complete matters
├── data/
│   └── uploads/                    # Local file storage (gitignored)
├── public/
│   └── fonts/                      # Source Serif 4 + Inter (self-hosted)
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout: dark theme, fonts, providers
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx        # Login page
│   │   ├── (app)/
│   │   │   ├── layout.tsx          # Authenticated layout: sidebar shell
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx        # Matters list
│   │   │   └── matters/
│   │   │       └── [id]/
│   │   │           ├── layout.tsx  # Matter workspace: header + tab nav
│   │   │           ├── page.tsx    # Redirect to /intake
│   │   │           ├── intake/
│   │   │           │   └── page.tsx
│   │   │           ├── analysis/
│   │   │           │   └── page.tsx
│   │   │           └── documents/
│   │   │               └── page.tsx
│   │   └── api/
│   │       └── upload/
│   │           └── route.ts        # File upload endpoint (multipart)
│   ├── components/
│   │   ├── matter/
│   │   │   ├── intake-form.tsx              # Multi-section form shell
│   │   │   ├── intake-section-jurisdiction.tsx
│   │   │   ├── intake-section-facts.tsx
│   │   │   ├── intake-section-objective.tsx
│   │   │   ├── intake-section-history.tsx
│   │   │   ├── intake-section-authorities.tsx
│   │   │   ├── intake-section-documents.tsx
│   │   │   ├── analysis-viewer.tsx          # Full analysis view with TOC
│   │   │   ├── analysis-section-card.tsx    # Single collapsible section
│   │   │   ├── citation-marker.tsx          # Inline superscript citation
│   │   │   ├── citation-panel.tsx           # Slide-over authority detail
│   │   │   ├── document-uploader.tsx        # Drag-drop + file list
│   │   │   ├── document-row.tsx             # Per-file row with status/toggle
│   │   │   ├── analysis-progress.tsx        # Staged generation progress
│   │   │   ├── export-modal.tsx             # PDF export configuration
│   │   │   ├── review-dropdown.tsx          # Unreviewed/Reviewed/Flagged
│   │   │   └── matter-header.tsx            # Matter title + status + tabs
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── accordion.tsx
│   │   │   ├── sheet.tsx                    # Slide-over panel (citations)
│   │   │   ├── switch.tsx                   # For include-in-analysis toggle
│   │   │   └── skeleton.tsx
│   │   └── layout/
│   │       ├── app-shell.tsx                # Sidebar + main content area
│   │       ├── sidebar.tsx
│   │       └── providers.tsx                # Session, toast, theme providers
│   ├── server/
│   │   ├── actions/
│   │   │   ├── auth.ts                      # (if needed beyond NextAuth)
│   │   │   ├── matters.ts                   # CRUD: create, list, get, archive
│   │   │   ├── intake.ts                    # Save/load intake sections
│   │   │   ├── documents.ts                 # Upload metadata, delete, toggle include
│   │   │   ├── analysis.ts                  # Trigger run, store results
│   │   │   ├── citations.ts                 # Update verification status
│   │   │   ├── sections.ts                  # Update review status
│   │   │   └── export.ts                    # Generate PDF bytes
│   │   └── lib/
│   │       ├── ai/
│   │       │   ├── prompt-template.ts       # The legal copilot system prompt
│   │       │   ├── prompt-builder.ts        # Intake + docs → user message
│   │       │   ├── openai-client.ts         # GPT-5.4 call wrapper
│   │       │   ├── output-parser.ts         # Raw response → sections
│   │       │   └── citation-extractor.ts    # Regex extraction + classification
│   │       ├── extraction/
│   │       │   ├── extract-pdf.ts           # pdf-parse wrapper
│   │       │   ├── extract-docx.ts          # mammoth wrapper
│   │       │   ├── extract-text.ts          # Plain text read
│   │       │   ├── extract-image.ts         # tesseract.js OCR wrapper
│   │       │   ├── convert-heic.ts          # HEIC → JPEG conversion
│   │       │   └── extractor.ts             # Router: file type → correct extractor
│   │       ├── export/
│   │       │   └── pdf-generator.ts         # @react-pdf/renderer document
│   │       └── file-storage.ts              # Save/read/delete from local FS
│   ├── lib/
│   │   ├── db.ts                            # Prisma client singleton
│   │   ├── constants.ts                     # Enums, jurisdiction lists, area-of-law list
│   │   ├── utils.ts                         # cn() + helpers
│   │   └── auth.ts                          # NextAuth config
│   ├── types/
│   │   ├── matter.ts                        # Matter, intake, document types
│   │   ├── analysis.ts                      # Run, section, citation types
│   │   └── next-auth.d.ts                   # Session augmentation
│   ├── hooks/
│   │   └── use-toast.ts
│   └── middleware.ts                        # Auth redirect + CSP headers
```

---

## 5. Data Model

### Prisma Schema

```prisma
// === ENUMS ===

enum MatterType {
  LITIGATION
  REGULATORY
  ADVISORY
  OTHER
}

enum MatterStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

enum DocumentType {
  PLEADING
  EVIDENCE
  CASE_LAW
  STATUTE
  CORRESPONDENCE
  OTHER
}

enum ExtractionMethod {
  PDF_PARSE        // pdf-parse (text-based PDF)
  DOCX_PARSE       // mammoth (DOCX)
  PLAIN_TEXT       // direct read (TXT)
  OCR              // tesseract.js (image)
}

enum ExtractionStatus {
  PENDING
  PROCESSING
  COMPLETE
  FAILED
}

enum AnalysisStatus {
  RUNNING
  COMPLETE
  FAILED
}

enum ReviewStatus {
  UNREVIEWED
  REVIEWED
  FLAGGED
}

enum CitationSource {
  AI_GENERATED
  USER_PROVIDED
}

enum VerificationStatus {
  UNVERIFIED
  VERIFIED
  FLAGGED
}

// === MODELS ===

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  name         String
  createdAt    DateTime @default(now())

  matters      Matter[]
  documents    Document[]
  analysisRuns AnalysisRun[]
}

model Matter {
  id         String       @id @default(uuid())
  userId     String
  title      String
  matterType MatterType
  status     MatterStatus @default(DRAFT)
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt
  archivedAt DateTime?

  user       User         @relation(fields: [userId], references: [id])
  intake     MatterIntake?
  documents  Document[]
  analysisRuns AnalysisRun[]

  @@index([userId, status])
}

model MatterIntake {
  id                    String   @id @default(uuid())
  matterId              String   @unique

  // Section 1: Jurisdiction (required)
  province              String?
  courtLevel            String?
  jurisdictionType      String?  // "federal" | "provincial"
  areaOfLaw             String?

  // Section 2: Facts & Parties (required)
  facts                 String?  // Rich text (HTML from Tiptap)
  parties               Json?    // [{ name: string, role: string }]

  // Section 3: Legal Objective (required)
  desiredOutcome        String?
  constraints           String?

  // Section 4: Procedural History (optional)
  proceduralStage       String?
  priorDecisions        String?
  keyDates              Json?    // [{ date: string, event: string }]

  // Section 5: Known Authorities (optional)
  supportingAuthorities Json?    // [{ caseName, citation, relevance }]
  opposingArguments     String?
  opposingAuthorities   Json?    // [{ caseName, citation, relevance }]

  updatedAt             DateTime @updatedAt

  matter                Matter   @relation(fields: [matterId], references: [id], onDelete: Cascade)
}

model Document {
  id                String           @id @default(uuid())
  matterId          String
  userId            String
  originalFilename  String
  storagePath       String           // UUID-based path on local FS
  mimeType          String
  fileSize          Int              // bytes
  documentType      DocumentType     @default(OTHER)

  extractionMethod  ExtractionMethod?
  extractionStatus  ExtractionStatus @default(PENDING)
  extractedText     String?          // Full extracted text
  extractionError   String?          // Error message if failed
  ocrConfidence     Float?           // 0.0-1.0, only for OCR extractions
  pageCount         Int?

  includeInAnalysis Boolean          @default(true)

  uploadedAt        DateTime         @default(now())

  matter            Matter           @relation(fields: [matterId], references: [id], onDelete: Cascade)
  user              User             @relation(fields: [userId], references: [id])

  @@index([matterId])
}

model AnalysisRun {
  id                String         @id @default(uuid())
  matterId          String
  userId            String
  runNumber         Int
  status            AnalysisStatus

  // Snapshot: frozen state of inputs at run time
  inputSnapshot     Json           // Full intake data
  documentExcerpts  Json           // [{ docId, filename, type, excerpt, method }]

  // Raw AI response
  rawOutput         String?

  // AI metadata
  promptVersion     String         // e.g. "v1"
  model             String         // e.g. "gpt-5.4"
  inputTokens       Int?
  outputTokens      Int?
  latencyMs         Int?
  errorMessage      String?

  startedAt         DateTime       @default(now())
  completedAt       DateTime?

  matter            Matter         @relation(fields: [matterId], references: [id], onDelete: Cascade)
  user              User           @relation(fields: [userId], references: [id])
  sections          AnalysisSection[]
  citations         Citation[]

  @@index([matterId])
  @@unique([matterId, runNumber])
}

model AnalysisSection {
  id            String       @id @default(uuid())
  runId         String
  sectionKey    String       // e.g. "executive_assessment", "issues"
  sectionOrder  Int
  title         String       // Display heading
  summary       String       // 2-3 sentence summary
  content       String       // Full section content (markdown)
  reviewStatus  ReviewStatus @default(UNREVIEWED)

  run           AnalysisRun  @relation(fields: [runId], references: [id], onDelete: Cascade)
  citations     Citation[]

  @@index([runId])
}

model Citation {
  id                 String             @id @default(uuid())
  runId              String
  sectionId          String
  citationText       String             // Full citation string
  caseName           String?
  year               Int?
  court              String?
  propositionUsedFor String?            // What legal point it supports
  source             CitationSource     @default(AI_GENERATED)
  verificationStatus VerificationStatus @default(UNVERIFIED)

  run                AnalysisRun        @relation(fields: [runId], references: [id], onDelete: Cascade)
  section            AnalysisSection    @relation(fields: [sectionId], references: [id], onDelete: Cascade)

  @@index([runId])
  @@index([sectionId])
}
```

### What Is Stored vs Computed

| Data                     | Stored                      | Computed                               |
| ------------------------ | --------------------------- | -------------------------------------- |
| Intake fields            | DB (MatterIntake)           | —                                      |
| Upload file bytes        | Local filesystem            | —                                      |
| Extracted text           | DB (Document.extractedText) | —                                      |
| OCR confidence           | DB (Document.ocrConfidence) | From Tesseract output                  |
| Raw AI output            | DB (AnalysisRun.rawOutput)  | —                                      |
| Parsed sections          | DB (AnalysisSection rows)   | At parse time, then stored             |
| Extracted citations      | DB (Citation rows)          | At parse time, then stored             |
| Review progress ("4/10") | —                           | Computed from section reviewStatus     |
| Intake completeness      | —                           | Computed from non-null required fields |

---

## 6. AI Orchestration Contract

### System Prompt Storage

File: `src/server/lib/ai/prompt-template.ts`

```typescript
export const PROMPT_VERSION = "v1";

export const LEGAL_COPILOT_SYSTEM_PROMPT = `
[The full Canadian Legal Strategist CoPilot prompt — verbatim, as a template literal]
`;
```

Stored in code. Version string recorded on every AnalysisRun. Not in the database. Not user-editable.

### Intake → Model Input

File: `src/server/lib/ai/prompt-builder.ts`

**Function:** `buildUserMessage(intake: MatterIntake, documents: DocumentExcerpt[]): string`

Rules:

- Wrap all user-sourced content in `<matter_context>` and `<uploaded_documents>` XML delimiters
- Omit sections where all fields are null/empty — do not send "None provided"
- Truncate each document excerpt to 3000 characters
- Max 5 documents included
- For OCR-derived text, prepend: `[Note: This text was extracted via OCR and may contain errors.]`
- End with the exact 10-section instruction:

```
Provide a complete legal analysis with the following sections:
1. Executive Assessment
2. Issues to Decide
3. Governing Law
4. Application to the Facts
5. Strongest Arguments in Favour
6. Best Counterarguments and Rebuttals
7. Procedural Strategy
8. Authority Map (all cited authorities with full citations)
9. Risk Analysis
10. Draft Advocacy Points / Work-Product Support

For each authority you cite, provide the full citation.
Distinguish clearly between established law and novel arguments.
```

### Document Inclusion

Each document has a boolean `includeInAnalysis` field. Default: `true` for successful extractions, `false` for failed.

The user toggles this on the Documents tab before running analysis. The "Run Analysis" confirmation modal lists which documents will be included.

Only documents with `includeInAnalysis === true` AND `extractionStatus === 'COMPLETE'` are sent to the model.

### Output Section Schema

The parser expects 10 sections. Internal keys:

| Order | Key                    | Expected Title Pattern                        |
| ----- | ---------------------- | --------------------------------------------- |
| 1     | `executive_assessment` | "Executive Assessment"                        |
| 2     | `issues`               | "Issues to Decide"                            |
| 3     | `governing_law`        | "Governing Law"                               |
| 4     | `application`          | "Application to the Facts"                    |
| 5     | `arguments_for`        | "Strongest Arguments"                         |
| 6     | `counterarguments`     | "Counterarguments" or "Best Counterarguments" |
| 7     | `procedural_strategy`  | "Procedural Strategy"                         |
| 8     | `authority_map`        | "Authority Map"                               |
| 9     | `risk_analysis`        | "Risk Analysis"                               |
| 10    | `work_product`         | "Draft Advocacy" or "Work-Product"            |

### Output Parsing

File: `src/server/lib/ai/output-parser.ts`

**Function:** `parseAnalysisOutput(raw: string): ParsedSection[]`

Algorithm:

1. Split on pattern: `/^\s*(?:#{1,3}\s*)?(?:\*{1,2})?\d{1,2}[\.\)]\s*/m`
2. For each chunk: extract title (first line), everything else is content
3. Generate summary: first 2 sentences of content (split on `. ` or `.\n`)
4. Match title to expected section keys via fuzzy match (case-insensitive substring)
5. Unmatched chunks → assign key `unknown_{n}`

**Fallback:** If fewer than 3 sections detected, treat entire output as one section with key `full_analysis` and title "Full Analysis". Never show a blank screen.

### Citation Extraction

File: `src/server/lib/ai/citation-extractor.ts`

**Function:** `extractCitations(content: string, sectionId: string, userAuthorities: UserAuthority[]): Citation[]`

Patterns (regex):

```
Neutral:     /\d{4}\s+[A-Z]{2,5}\s+\d+/g          → "2024 SCC 15"
Traditional: /\[\d{4}\]\s+\d+\s+\w+\s+\d+/g       → "[2008] 1 SCR 190"
Statute:     /[A-Z]{2,3}\s+\d{4},\s*c\s+[\w-]+/g   → "RSC 1985, c C-46"
```

Provenance classification:

- Compare extracted citation against `intake.supportingAuthorities` and `intake.opposingAuthorities` (case-insensitive substring match on citation text)
- Match → `USER_PROVIDED`
- No match → `AI_GENERATED`

All AI_GENERATED citations default to `verificationStatus: UNVERIFIED`.

### Traceability

Every AnalysisRun stores:

- `inputSnapshot`: complete JSON of MatterIntake at run time
- `documentExcerpts`: array of `{ docId, filename, documentType, excerpt (truncated), extractionMethod }`
- `rawOutput`: the full model response string
- `promptVersion`: "v1"
- `model`: "gpt-5.4"
- `inputTokens`, `outputTokens`, `latencyMs`

Fully reconstructable. "This is exactly what was sent and what came back."

### Parse Failure Handling

If `parseAnalysisOutput` returns fewer than 3 sections:

- Store rawOutput as-is
- Create one AnalysisSection: `{ sectionKey: "full_analysis", title: "Full Analysis", content: rawOutput, summary: first2Sentences }`
- Display with a banner: "This analysis could not be fully structured. Displaying complete output."
- Citation extraction still runs against the full text

---

## 7. OCR / Document Handling Design

### File Type Matrix

| Type  | Extensions   | MIME Types                                                              | Extraction      | Library                         |
| ----- | ------------ | ----------------------------------------------------------------------- | --------------- | ------------------------------- |
| PDF   | .pdf         | application/pdf                                                         | Text extraction | `pdf-parse`                     |
| Word  | .docx        | application/vnd.openxmlformats-officedocument.wordprocessingml.document | Parse to text   | `mammoth`                       |
| Text  | .txt         | text/plain                                                              | Direct read     | `fs.readFile`                   |
| Photo | .jpg, .jpeg  | image/jpeg                                                              | OCR             | `tesseract.js`                  |
| Photo | .png         | image/png                                                               | OCR             | `tesseract.js`                  |
| Photo | .heic, .heif | image/heic, image/heif                                                  | Convert → OCR   | `heic-convert` → `tesseract.js` |

### Upload Pipeline

```
Client: validate extension + size (25MB) client-side
  ↓
API route: POST /api/upload
  1. Validate MIME type server-side (magic bytes via file-type package)
  2. Validate extension against allowlist
  3. Validate size ≤ 25MB
  4. Generate UUID filename: {uuid}.{ext}
  5. Save to ./data/uploads/{matterId}/{uuid}.{ext}
  6. Create Document record (status: PENDING)
  7. Run extraction inline (async/await, not background job):
     → route to correct extractor based on MIME type
     → update Document with extractedText, extractionStatus, etc.
  8. Return document metadata to client
```

### Per-Type Extraction Detail

#### PDF (`extract-pdf.ts`)

```typescript
import pdfParse from "pdf-parse";

// Input: file buffer
// Output: { text: string, pageCount: number }
// Failure: extractionStatus = FAILED, extractionError = error message
// Notes: If extracted text < 50 chars for a multi-page PDF, likely a scanned doc.
//        Set extractionStatus = FAILED, extractionError =
//        "This PDF appears to be scanned. Upload as image files for OCR, or use a text-based PDF."
```

#### DOCX (`extract-docx.ts`)

```typescript
import mammoth from "mammoth";

// Input: file buffer
// Output: { text: string }
// Failure: extractionStatus = FAILED, extractionError = error message
```

#### TXT (`extract-text.ts`)

```typescript
// Input: file buffer
// Output: { text: buffer.toString('utf-8') }
// Failure: extremely unlikely, but handle encoding errors
```

#### Image OCR (`extract-image.ts`)

```typescript
import { createWorker } from "tesseract.js";

// Input: file buffer (JPEG or PNG — HEIC pre-converted)
// Output: { text: string, confidence: number }
//
// confidence = Tesseract's mean word confidence (0-100), stored as 0.0-1.0
//
// Process:
// 1. If HEIC: convert to JPEG first via heic-convert
// 2. Create Tesseract worker (eng language)
// 3. Recognize text
// 4. Return text + confidence
// 5. Terminate worker
//
// Failure modes:
// - Image too small/blurry → low confidence, possibly empty text
// - Timeout (set 30-second limit) → FAILED
// - No text detected → COMPLETE but extractedText is empty string
```

#### HEIC Conversion (`convert-heic.ts`)

```typescript
import convert from "heic-convert";

// Input: HEIC buffer
// Output: JPEG buffer
// This runs before OCR. Pure format conversion.
```

### Extraction Status Communication

| Status                           | UI Display                                          | Color         |
| -------------------------------- | --------------------------------------------------- | ------------- |
| PENDING                          | "Processing..."                                     | Gray, spinner |
| PROCESSING                       | "Extracting text..." or "Running OCR..."            | Gray, spinner |
| COMPLETE (PDF/DOCX/TXT)          | "✓ Extracted ({pageCount} pages)"                   | Green         |
| COMPLETE (OCR, confidence ≥ 0.7) | "✓ OCR extracted (may contain errors)"              | Amber         |
| COMPLETE (OCR, confidence < 0.7) | "⚠ OCR extracted — low quality, review recommended" | Amber/Red     |
| COMPLETE (OCR, empty text)       | "⚠ No text detected in image"                       | Red           |
| FAILED                           | "✗ Extraction failed: {reason}"                     | Red           |

### What Gets Sent to the Model

For each document with `includeInAnalysis === true` and `extractionStatus === COMPLETE`:

```
[Document: {originalFilename}]
Type: {documentType}
Extraction: {extractionMethod === 'OCR' ? 'OCR (may contain errors)' : 'Text extraction'}
Content (excerpt):
{extractedText.substring(0, 3000)}
```

OCR-derived text always carries the "(may contain errors)" label in the prompt context.

### What Stays Out Unless Explicitly Included

- Documents with `includeInAnalysis === false` → never sent
- Documents with `extractionStatus === FAILED` → never sent (toggle defaults to OFF)
- Documents with empty `extractedText` → never sent (nothing to include)
- The original file bytes → never sent (only extracted text)

### Storage + Metadata

Files stored at: `./data/uploads/{matterId}/{uuid}.{ext}`

Document DB record tracks:

- `originalFilename`: what the user uploaded
- `storagePath`: UUID-based internal path
- `mimeType`: validated server-side
- `fileSize`: bytes
- `extractionMethod`: PDF_PARSE / DOCX_PARSE / PLAIN_TEXT / OCR
- `extractionStatus`: PENDING / PROCESSING / COMPLETE / FAILED
- `extractedText`: full text (may be large for multi-page docs)
- `extractionError`: error message if failed
- `ocrConfidence`: 0.0-1.0, only populated for OCR extractions
- `includeInAnalysis`: boolean, user-controllable

---

## 8. Security Implementation Checklist

### Mandatory for Pilot

| #   | Control                          | Implementation                                                                                                                                                                                                           | Verify By                                                                            |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| 1   | **Server-side LLM calls**        | OpenAI API key in `.env` only. All calls from `src/server/lib/ai/openai-client.ts`. Never imported in client components.                                                                                                 | Check browser DevTools Network — no `api.openai.com` requests                        |
| 2   | **Auth**                         | NextAuth v5, credentials provider, bcrypt 12 rounds. JWT session (8h). Cookies: httpOnly, Secure (if HTTPS), SameSite=Strict.                                                                                            | Test: access /dashboard without login → redirect to /login                           |
| 3   | **User-matter isolation**        | Every server action: `const user = await requireUser()` then `where: { userId: user.id }` on all queries.                                                                                                                | Test: modify matter ID in URL → 404, not another user's data                         |
| 4   | **Input validation**             | Zod schema on every server action. Validate before touching DB.                                                                                                                                                          | Review every server action file                                                      |
| 5   | **File upload safety**           | Extension allowlist: `.pdf, .docx, .txt, .jpg, .jpeg, .png, .heic, .heif`. MIME validation via `file-type` package. Max 25MB. UUID filenames.                                                                            | Test: upload .exe → rejected. Upload manipulated extension → rejected by MIME check. |
| 6   | **No directory traversal**       | UUID filenames only. Never use original filename in storage path.                                                                                                                                                        | Review `file-storage.ts`                                                             |
| 7   | **CSP headers**                  | Set in `middleware.ts`: `default-src 'self'; script-src 'self' 'nonce-{random}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none'` | Check response headers in DevTools                                                   |
| 8   | **No sensitive data in logs**    | Never log: matter content, facts, analysis output, document text, passwords, tokens, prompts, model responses. DO log: action type, userId, matterId, timestamp, error codes.                                            | Grep codebase for `console.log` with content variables                               |
| 9   | **Prompt injection containment** | User content in `<matter_context>` and `<uploaded_documents>` XML delimiters. System prompt is static. User content never interpolated into system message.                                                              | Review `prompt-builder.ts`                                                           |
| 10  | **SQL injection prevention**     | Prisma ORM only. No `$queryRaw` or `$executeRaw`.                                                                                                                                                                        | Grep for `queryRaw` / `executeRaw` — expect zero results                             |
| 11  | **API key isolation**            | `OPENAI_API_KEY` in `.env`. `.env` in `.gitignore`. Not in Dockerfile. Passed via Docker Compose environment.                                                                                                            | Check `.gitignore`, check Dockerfile, check client bundle                            |
| 12  | **File access auth**             | Files served through authenticated API route only, not as static assets. `./data/uploads/` is NOT in `public/`.                                                                                                          | Test: direct URL to file without auth → 401                                          |

### Good to Add If Fast

| Control                                                          | Notes                                                           |
| ---------------------------------------------------------------- | --------------------------------------------------------------- |
| HTTPS via reverse proxy                                          | Caddy or nginx with Let's Encrypt if deploying beyond localhost |
| Security headers (X-Content-Type-Options, X-Frame-Options, HSTS) | Add in middleware.ts alongside CSP                              |
| Rate limiting on login                                           | 5 attempts per 15 min — simple in-memory counter                |
| Structured JSON logging                                          | Replace console.\* with a logger that scrubs content            |

### Defer Until Later

| Control                      | Notes                               |
| ---------------------------- | ----------------------------------- |
| 2FA / TOTP                   | Controlled pilot                    |
| Encryption at rest           | OS-level disk encryption sufficient |
| Malware scanning             | Trusted pilot users                 |
| Audit log viewer UI          | Log to stdout, no viewer            |
| Session revocation list      | Just let JWT expire                 |
| RBAC                         | Single user per instance            |
| Document quarantine pipeline | Type/size validation is sufficient  |

---

## 9. Screen-by-Screen Build Spec

### Login (`/login`)

**Purpose:** Authenticate user.

**Components:**

- App wordmark ("LawOps") — centered, minimal
- Email input
- Password input
- Sign in button
- Error message area

**States:**

- Default: empty form
- Loading: button shows spinner, inputs disabled
- Error: "Invalid email or password" below form (red text, not a modal)

**Actions:** Submit credentials → on success redirect to `/dashboard`

**Notes:** No registration link. No forgot password. No OAuth. Pre-created accounts only.

---

### Dashboard (`/dashboard`)

**Purpose:** List all matters for the current user. Create new ones.

**Components:**

- Header: "LawOps" wordmark left, user email + sign out right
- Page title: "Matters"
- [+ New Matter] button (top-right, primary accent)
- Matter table: Title | Type | Jurisdiction | Status | Last Updated
- Status filter tabs: All / Active / Draft / Archived
- Create matter dialog (modal)

**States:**

- Default: table with matters
- Empty: "No matters yet. Create your first matter to get started." + prominent create button
- Loading: skeleton rows (3)
- Create modal: title input + matter type dropdown + [Create] button

**Actions:**

- Click row → navigate to `/matters/{id}/intake`
- Click [+ New Matter] → open modal → create → navigate to new matter
- Click status tab → filter table
- Sign out → redirect to `/login`

---

### Matter Workspace Layout (`/matters/[id]/layout.tsx`)

**Purpose:** Wrapper for all matter tabs. Shows matter header + tab navigation.

**Components:**

- Back arrow → `/dashboard`
- Matter title (editable inline)
- Status badge (DRAFT / ACTIVE / ARCHIVED)
- Tab bar: Intake | Analysis | Documents
- [Run Analysis] button (in header, visible from all tabs, disabled until intake complete)
- [Export] button (in header, visible only when analysis exists)

**States:**

- No analysis yet: Analysis tab shows empty state, Export button hidden
- Analysis running: Run Analysis button shows spinner, disabled
- Analysis complete: Analysis tab has content, Export button visible

---

### Intake Tab (`/matters/[id]/intake`)

**Purpose:** Collect structured legal context.

**Components:**

- Left rail: section progress (6 items, checkmark/circle/current indicator)
- Main area: current section form
- Bottom bar: [Save Draft] + [← Previous] + [Next →]
- Required section indicator (red asterisk or "(required)" label)

**Section forms:**

1. **Jurisdiction & Forum** — Province dropdown (13 provinces/territories), Court level dropdown (cascaded from province), Federal/Provincial toggle, Area of law (searchable combobox from constant list)

2. **Facts & Parties** — Tiptap rich text editor for facts (5000 char limit shown), Structured party input (add rows: name + role dropdown)

3. **Legal Objective** — Textarea for desired outcome, Textarea for constraints (optional)

4. **Procedural History** — Dropdown for current stage, Textarea for prior decisions, Structured date+event input (add rows)

5. **Known Authorities** — Structured input (add rows: case name + citation + relevance note), Textarea for opposing arguments, Structured input for opposing authorities

6. **Documents** — (Redirects to Documents tab or shows inline upload zone — implementation choice: redirect is simpler)

**States:**

- Section incomplete: circle indicator in rail
- Section has data: checkmark indicator
- Required section empty: circle with subtle red indicator
- Auto-save: "Saved" indicator near Save Draft button (fade in, fade out after 2s)
- Saving: "Saving..." text
- Validation error: inline field error messages (red, below field)

**Loading:** Skeleton form on initial load.

**Empty:** Default form state with placeholder text in every field.

---

### Analysis Tab (`/matters/[id]/analysis`)

**Purpose:** Display structured AI analysis with review controls.

**Components:**

- Sticky left TOC: numbered section list with review status icons + "X/10 reviewed" counter
- Main area: scrollable section cards
- Each section card:
  - Section number + title
  - Summary text (always visible)
  - Expandable detail (collapsed by default, serif font)
  - Inline citation markers (superscript numbers, clickable)
  - Review dropdown: [Unreviewed ▾] / Reviewed ✓ / Flagged ⚠
- Citation slide-over panel (Radix Sheet, slides from right)
- Footer: "⚖ AI-generated analysis. Verify all authorities before reliance."

**States:**

- No analysis: "No analysis generated yet. Complete the intake form and click Run Analysis." + arrow pointing to the Run Analysis button
- Running: Full-screen staged progress overlay (see analysis-progress component)
- Complete: section cards displayed
- Failed: "Analysis generation failed. [error message]. [Try Again]"

**Loading:** Progress overlay during generation. Skeleton cards on page load if data is fetching.

**Citation panel states:**

- Default: closed
- Open: shows citation detail with verify/flag buttons
- After verify/flag: badge updates immediately, panel stays open

---

### Documents Tab (`/matters/[id]/documents`)

**Purpose:** Upload and manage files attached to this matter.

**Components:**

- Drag-drop upload zone (dashed border, "Drop PDF, DOCX, TXT, or document photos (JPG, PNG, HEIC)")
- Document list (below upload zone):
  - Per row: filename | document type dropdown | extraction status | include toggle | delete button
  - Extraction status with appropriate color/icon (see section 7 matrix)
  - Include-in-analysis toggle (switch component)
- "Max 5 files, 25MB each" note

**States:**

- Empty: upload zone prominent, "No documents uploaded" text below
- Uploading: progress indicator on the file being uploaded
- Extracting: spinner + "Extracting text..." or "Running OCR..."
- Complete: green/amber/red status per extraction type/quality
- Error: red status with error message, include toggle defaulted to OFF
- At limit: upload zone grayed out, "Maximum 5 documents reached"

**Actions:**

- Drop/select files → upload + extract inline → new row appears
- Change document type dropdown → server action update
- Toggle include → server action update
- Delete → confirm toast ("Remove this document?") → delete file + record

---

### Export Modal

**Purpose:** Generate and download PDF export of the analysis.

**Components:**

- Dialog overlay
- Section checkboxes (all checked by default, each with section title)
- Warning (if unreviewed sections): "3 sections have not been reviewed."
- [Export Reviewed Only] [Export All] [Cancel] buttons (when warning applies)
- [Generate PDF] [Cancel] buttons (when all reviewed)
- Generating state: spinner + "Generating PDF..."

**States:**

- Default: checkboxes + generate button
- With unreviewed warning: amber warning banner + two export options
- Generating: spinner, buttons disabled
- Complete: browser download triggers, modal closes
- Error: "PDF generation failed. Try again." with retry button

---

## 10. Build Order

### Phase 1: Foundation (Days 1-3)

**Build:**

- `npm create next-app` with TypeScript, Tailwind, App Router
- Tailwind v4 config, dark theme defaults, font setup (Inter + Source Serif 4)
- Radix UI primitives: Button, Input, Dialog, Tabs, Badge, Sheet, Switch, Tooltip, Dropdown
- Prisma schema (all models from section 5)
- Docker Compose: Next.js + PostgreSQL
- NextAuth v5 config: credentials provider, bcrypt, JWT
- Login page
- Middleware: auth redirect, CSP headers
- App shell layout: sidebar, header, providers
- `requireUser()` helper function
- Seed script: 1 demo user

**Dependencies:** None  
**Hardcode:** Auth config, CSP policy, font loading  
**Don't polish:** UI primitives beyond functional  
**Done when:** Can run `docker compose up`, open browser, log in, see empty dashboard

### Phase 2: Matter CRUD (Days 4-5)

**Build:**

- Server actions: `createMatter`, `listMatters`, `getMatter`, `archiveMatter`
- Dashboard page: matter table, status filter tabs, create modal
- Matter workspace layout: header, tab navigation, [Run Analysis] button (disabled)
- Empty states for all tabs
- MatterIntake record created alongside Matter (empty, 1:1)

**Dependencies:** Phase 1  
**Hardcode:** Matter type list, status transitions  
**Don't polish:** Table sorting, matter search  
**Done when:** Can create a matter, see it in the list, navigate to workspace tabs

### Phase 3: Intake Form (Days 6-10)

**Build:**

- Server actions: `saveIntakeSection`, `getIntake`
- Intake form shell with section progress rail
- All 6 section forms with React Hook Form + Zod
- Jurisdiction section: province dropdown, court level cascade, jurisdiction type toggle, area of law combobox
- Facts section: Tiptap rich text editor, structured parties input
- Objective section: desired outcome textarea, constraints textarea
- History section: stage dropdown, prior decisions textarea, key dates structured input
- Authorities section: structured inputs for supporting + opposing
- Documents section: redirect to Documents tab (or inline upload zone)
- Auto-save on field blur (debounced server action, 1s)
- "Saved" indicator
- `constants.ts`: province list, court levels per province, area-of-law list, procedural stages
- Intake completeness check: enable [Run Analysis] when sections 1-3 have required fields

**Dependencies:** Phase 2  
**Hardcode:** Province/court/area lists as constant arrays  
**Don't polish:** Form animations, field help text  
**Done when:** Can fill all 6 sections, auto-saves work, Run Analysis button enables when required sections complete

### Phase 4: Document Upload + OCR (Days 11-14)

**Build:**

- API route: `POST /api/upload` — MIME validation, size check, UUID naming, save to disk
- API route: `GET /api/files/[id]` — authenticated file serving
- Server actions: `listDocuments`, `deleteDocument`, `updateDocumentType`, `toggleIncludeInAnalysis`
- `file-storage.ts`: save, read, delete on local FS
- `extractor.ts`: route to correct extractor by MIME type
- `extract-pdf.ts`: pdf-parse wrapper
- `extract-docx.ts`: mammoth wrapper
- `extract-text.ts`: direct read
- `extract-image.ts`: tesseract.js OCR wrapper (with confidence)
- `convert-heic.ts`: heic-convert to JPEG
- Documents tab: upload zone, file list, type dropdown, extraction status, include toggle, delete
- Inline extraction: upload triggers extraction immediately, UI shows progress

**Dependencies:** Phase 2 (needs matter context)  
**Hardcode:** Max 5 files, 25MB limit, extension allowlist  
**Don't polish:** Upload progress percentage, drag-drop visual effects  
**Done when:** Can upload PDF/DOCX/TXT/JPG/PNG/HEIC, see extraction status, toggle include, delete files. OCR works on a photo of a document and shows confidence label.

### Phase 5: AI Analysis Pipeline (Days 15-19)

**Build:**

- `prompt-template.ts`: legal copilot system prompt stored as constant
- `prompt-builder.ts`: intake + documents → structured user message
- `openai-client.ts`: GPT-5.4 call with streaming disabled (simpler), timeout 120s
- `output-parser.ts`: split response into sections
- `citation-extractor.ts`: regex extraction + classification
- Server action: `runAnalysis` — build prompt, call API, parse output, store sections + citations
- Analysis run creation: snapshot intake, snapshot document excerpts
- Run number auto-increment per matter
- Analysis progress UI: staged cosmetic progress during API call
- Handle API errors: timeout, rate limit, 5xx → user-facing error message

**Dependencies:** Phase 3 (intake data), Phase 4 (document text)  
**Hardcode:** Model name, prompt version, temperature (0.3), max tokens  
**Don't polish:** Streaming, progress bar accuracy  
**Done when:** Can run analysis from complete intake, see raw result stored in DB, sections + citations parsed and stored. End-to-end from intake to stored parsed output.

### Phase 6: Analysis Viewer (Days 20-24)

**Build:**

- Analysis viewer component: sticky TOC + scrollable sections
- Section card component: title, summary, collapsible detail, review dropdown, citation markers
- Citation marker component: superscript number, clickable
- Citation panel (Sheet): full detail, provenance badge, verify/flag buttons
- Review dropdown component: Unreviewed/Reviewed/Flagged
- Server actions: `updateSectionReview`, `updateCitationVerification`
- Review progress counter in TOC
- Footer disclaimer
- Serif font rendering for section content
- [Run Analysis] flow: confirmation modal → progress overlay → auto-switch to Analysis tab
- Empty state when no analysis exists

**Dependencies:** Phase 5  
**Hardcode:** Section display order, confidence badge colors  
**Don't polish:** Scroll-to-section animation, citation highlight effects  
**Done when:** Full analysis viewer works. Can expand/collapse sections, click citations, change review state, see progress counter. Looks like a legal memo, not a markdown dump.

### Phase 7: Export + Polish (Days 25-28)

**Build:**

- `pdf-generator.ts`: @react-pdf/renderer document template
  - Professional header (matter title, date, "AI-ASSISTED DRAFT — VERIFY BEFORE RELIANCE")
  - Sections with headings
  - Authority footnotes
  - Review status labels per section
  - Serif font
  - Watermark
- Export modal: section selection, unreviewed warning, generate button
- Server action: `generateExport` → returns PDF buffer → client downloads
- Seed data: 1-2 matters with complete intake + real AI-generated analysis
- Polish pass:
  - Loading states on every page
  - Error states everywhere
  - Empty states everywhere
  - Consistent spacing (verify against Tailwind scale)
  - Page titles (`<title>` per route)
  - Toast notifications for save/delete/error
  - Tab keyboard navigation
  - Focus management on modals

**Dependencies:** Phase 6  
**Hardcode:** PDF template, watermark text, header text  
**Don't polish:** PDF template customization, section reordering  
**Done when:** Complete end-to-end workflow: login → create matter → fill intake → upload docs (including photo) → run analysis → review sections/citations → export PDF. Exported PDF looks like a real legal memo draft.

---

## 11. Acceptance Criteria

### Pilot-Ready Checklist

**Auth & Access:**

- [ ] Can log in with pre-created credentials
- [ ] Cannot access any page without auth (redirects to /login)
- [ ] Cannot access another user's matters (returns 404)
- [ ] OpenAI API key not visible in browser DevTools

**Matters:**

- [ ] Can create a matter with title and type
- [ ] Can see matter list on dashboard
- [ ] Can filter by status (Active/Draft/Archived)
- [ ] Can archive a matter

**Intake:**

- [ ] Can fill all 6 sections
- [ ] Required field validation works (Jurisdiction, Facts, Objective)
- [ ] Auto-save works (change field, navigate away, come back — data preserved)
- [ ] Province → court level cascade works
- [ ] Area of law searchable dropdown works
- [ ] Structured inputs work (parties, dates, authorities)
- [ ] Rich text editor works for facts narrative

**Documents:**

- [ ] Can upload PDF and see extracted text status
- [ ] Can upload DOCX and see extracted text status
- [ ] Can upload TXT and see extracted text status
- [ ] Can upload JPG/PNG photo and see OCR extraction with confidence label
- [ ] Can upload HEIC photo and see OCR extraction
- [ ] OCR-derived text labeled as "may contain errors"
- [ ] Can toggle include/exclude per document
- [ ] Can change document type
- [ ] Can delete a document
- [ ] Upload rejects disallowed file types
- [ ] Upload rejects files > 25MB
- [ ] Max 5 files enforced

**Analysis:**

- [ ] [Run Analysis] disabled until required intake sections complete
- [ ] Confirmation modal shows which documents will be included
- [ ] Staged progress shows during generation
- [ ] Analysis produces 10 structured sections (or graceful fallback)
- [ ] Citations extracted and displayed with provenance labels
- [ ] OCR-derived document text labeled in analysis prompt
- [ ] Raw output stored for traceability
- [ ] Input snapshot stored for traceability

**Review:**

- [ ] Can expand/collapse analysis sections
- [ ] Can click citation markers to open detail panel
- [ ] Citation panel shows full citation, court, year, confidence, source, proposition
- [ ] Can mark citation as Verified or Flagged
- [ ] Can change section review status (Unreviewed/Reviewed/Flagged)
- [ ] TOC shows review progress count
- [ ] Footer disclaimer always visible

**Export:**

- [ ] Can export PDF
- [ ] PDF has professional header with matter title and date
- [ ] PDF has "AI-ASSISTED DRAFT" watermark
- [ ] PDF has sections with proper headings
- [ ] PDF has authorities as footnotes
- [ ] PDF has review status labels
- [ ] PDF uses serif font for content
- [ ] Unreviewed sections warning appears before export

**Security:**

- [ ] No API keys in client bundle
- [ ] CSP headers present on all responses
- [ ] File uploads validated server-side (MIME + extension + size)
- [ ] Files stored with UUID names (no original filename in path)
- [ ] Files only accessible through authenticated API route
- [ ] No matter content in server logs
- [ ] All server actions validate input with Zod
- [ ] All queries scoped by userId

**Polish:**

- [ ] Dark theme consistent throughout
- [ ] No broken empty states
- [ ] No unhandled loading states
- [ ] Error states show helpful messages, not stack traces
- [ ] Serif font (Source Serif 4) renders for analysis content
- [ ] Sans-serif font (Inter) for all UI chrome
- [ ] App feels like a real product, not a prototype

---

## 12. Biggest Build Risks

### 1. Tesseract.js Performance in Node

**Risk:** Tesseract.js OCR can be slow (10-30 seconds per image) and memory-intensive in Node.  
**Mitigation:** Set a 30-second timeout. Show "Running OCR..." status. If it's too slow in Docker, fall back to a smaller Tesseract model (`eng` only, no `osd`). Test early — don't discover this in Phase 7.  
**Test in Phase 4:** Upload a phone photo of a legal document. Measure time and memory. If > 30s or > 512MB RAM, evaluate alternatives (cloud OCR, or require text PDFs and defer image support).

### 2. Output Parser Instability

**Risk:** GPT-5.4 may not consistently format output with parseable section headers. Regex breaks on unexpected formatting.  
**Mitigation:** Test the prompt 5-10 times before building the parser. Document the actual output patterns. Build the parser against real outputs, not assumed patterns. The fallback (single "Full Analysis" section) is non-negotiable — it must work.  
**Test in Phase 5:** Run the prompt manually 10 times with varied inputs. Verify section detection works on all 10 outputs.

### 3. HEIC Support Complexity

**Risk:** `heic-convert` may have native dependency issues in Docker (Alpine Linux).  
**Mitigation:** Use a Node-based HEIC library. If it fails in Docker, make HEIC a soft dependency: accept HEIC uploads but show "Convert to JPEG before uploading for best results" if conversion fails. Never block the entire upload pipeline on HEIC.

### 4. PDF Export Quality

**Risk:** `@react-pdf/renderer` produces PDFs that look like web pages, not legal documents.  
**Mitigation:** Design the PDF template with proper margins (1 inch), serif font, 12pt body text, proper heading hierarchy, real footnotes. Test with a printed copy. If @react-pdf/renderer can't produce quality output, switch to Puppeteer (headless Chrome rendering an HTML template). This is a late-stage decision — prototype both if unsure.

### 5. Tiptap Bundle Size / Complexity

**Risk:** Tiptap adds significant JavaScript. Configuration is non-trivial.  
**Mitigation:** Use minimal Tiptap extensions: StarterKit only (bold, italic, headings, lists). No tables, no images, no collaboration. If Tiptap is too heavy, fall back to a plain `<textarea>` with a character counter. The facts field does not need rich formatting to be useful.

### 6. Scope Creep Into Chat/Refinement

**Risk:** During build, the temptation to add "ask a follow-up" or "refine this section" will be strong.  
**Mitigation:** The scope is locked. The pilot proves: intake → analysis → review → export. If the core loop works and there's time left, section refinement is the one allowed extension. Nothing else.

### 7. Seed Data Looks Fake

**Risk:** Pre-seeded matter has obviously fake facts or the AI analysis for it is poor.  
**Mitigation:** Run the real prompt against a realistic (but fictional) Canadian legal scenario. Store the actual AI output. The seed data should be indistinguishable from what a real user would produce. Do this in Phase 7, not as an afterthought.

---

## 13. Final Recommendation

### Final Locked Pilot Shape

Single-user legal analysis workbench. One workflow: intake → analysis → review → export. Supports text documents and document photos with OCR. No chat. No refinement. No teams.

### Final Locked Stack

| Layer           | Choice                                                      |
| --------------- | ----------------------------------------------------------- |
| Frontend        | Next.js 15 + React 19 + TypeScript + Tailwind v4 + Radix UI |
| Rich text       | Tiptap (StarterKit only)                                    |
| Forms           | React Hook Form + Zod                                       |
| Database        | PostgreSQL 17 + Prisma                                      |
| Auth            | NextAuth v5 (credentials)                                   |
| Files           | Local filesystem                                            |
| PDF extraction  | pdf-parse                                                   |
| DOCX extraction | mammoth                                                     |
| Image OCR       | tesseract.js                                                |
| HEIC conversion | heic-convert                                                |
| AI              | OpenAI GPT-5.4                                              |
| PDF export      | @react-pdf/renderer                                         |
| Deployment      | Docker Compose                                              |

### Final Locked Workflow

Sign in → create matter → fill 6-section intake (3 required) → upload docs + photos → toggle include → run analysis → review 10 sections + citations → mark reviewed/flagged → export PDF

### Final Locked Scope

10 must-have features + document photo OCR. No chat, no refinement, no teams, no DOCX export, no mobile, no admin, no registration flow.

### First Coding Milestone

**Phase 1 complete:** Docker Compose runs. PostgreSQL + Next.js start. Login works. Empty dashboard renders. App shell has dark theme with correct fonts. Auth redirects work. Prisma schema migrated.

This is the foundation everything else builds on. Start here.

---

_This is the build spec. Start coding._
