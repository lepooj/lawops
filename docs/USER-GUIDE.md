# LawOps — User Guide

## What Is LawOps

LawOps is a structured legal analysis workbench for Canadian legal professionals. You enter structured legal context about a matter — jurisdiction, facts, legal objective, known authorities — and the system generates an AI-assisted legal analysis with cited authorities, risk assessment, and recommended next steps.

It is not a chatbot. It is not a document Q&A tool. It is a structured intake → structured analysis → human review → export workflow.

---

## Getting Started

### Logging In

Open the app in your browser. You will see the LawOps login screen.

- Enter your email and password
- Click **Sign in**
- You will be redirected to the dashboard

Accounts are pre-created by an administrator. There is no self-registration.

### The Dashboard

After login, you land on the **Matters** dashboard. This is your home screen.

- **Matters list** — all your legal matters, sorted by last updated
- **Status filters** — filter by All, Active, Draft, or Archived
- **+ New Matter** — create a new matter
- **Demo matters** — if seeded, a blue banner at the top lets you jump straight to a completed demo analysis

Each matter row shows the title, type, jurisdiction, status, and last update date.

---

## Creating a Matter

Click **+ New Matter** on the dashboard.

- **Matter Title** — a descriptive name for the matter (e.g., "Singh v. Ontario Ministry — Wrongful Dismissal")
- **Matter Type** — choose Litigation, Regulatory, Advisory, or Other

Click **Create**. You land on the matter workspace with the Intake tab active.

---

## The Matter Workspace

Every matter has three tabs:

| Tab | Purpose |
|-----|---------|
| **Intake** | Enter structured legal context |
| **Analysis** | View AI-generated legal analysis |
| **Documents** | Upload and process supporting documents |

The header shows the matter title, status badge (DRAFT / ACTIVE / ARCHIVED), a mode selector, and the **Run Analysis** button.

---

## Intake — Entering Legal Context

The Intake tab is a structured form with 6 sections. The left sidebar shows your progress.

### Required Sections (marked "req")

These must have meaningful content before you can run analysis.

#### 1. Jurisdiction & Forum

- **Province / Territory** — select the Canadian province or territory
- **Jurisdiction Type** — Provincial or Federal
- **Court Level** — Superior Court, Court of Appeal, Provincial Court, Supreme Court of Canada, Federal Court, Tribunal, etc.
- **Area of Law** — select from the list (Administrative Law, Employment Law, Criminal Law, Charter Rights, etc.)

#### 2. Facts & Parties

- **Fact Narrative** — describe the key facts of the matter. Include relevant dates, events, and circumstances. Up to 5,000 characters.
- **Parties** — add each party with their name and role (Plaintiff, Defendant, Applicant, Respondent, etc.)

#### 3. Legal Objective

- **Desired Outcome** — what you are seeking (e.g., "Obtain judicial review and quash the decision")
- **Constraints** — optional. Budget, time, relationship, or other limitations.

### Optional Sections

#### 4. Procedural History

- **Current Stage** — where the matter stands procedurally (Pre-litigation, Pleadings, Discovery, Trial, Appeal, etc.)
- **Prior Decisions / Orders** — describe any relevant prior decisions
- **Key Dates** — add date + event pairs for the timeline

#### 5. Known Authorities

- **Supporting Authorities** — add cases or statutes that support your position (case name + citation + why it matters)
- **Opposing Arguments** — describe arguments you expect from the other side
- **Opposing Authorities** — add cases the other side may rely on

#### 6. Documents

This section links to the Documents tab. Documents are managed separately.

### Auto-Save

Changes are saved automatically as you type (with a short delay). You will see "Saving..." and then "Saved" in the bottom bar. You do not need to manually save.

### Readiness

The left sidebar shows a green "Ready for analysis" indicator when the three required sections have enough content. The **Run Analysis** button in the header also enables at this point.

---

## Documents — Uploading Supporting Materials

The Documents tab lets you upload files that can be included in the analysis.

### Supported File Types

| Type | Extensions |
|------|-----------|
| PDF | .pdf |
| Word | .docx |
| Plain text | .txt |
| Photos of documents | .jpg, .jpeg, .png, .heic |

Maximum 5 files per matter, 25 MB each.

### Uploading

- Drag and drop files onto the upload zone, or click **Choose files**
- Each file appears as a card showing filename, size, upload date, and extraction status

### Text Extraction

After uploading, documents start in **Pending** status. Text has not been extracted yet.

- Click **Extract Text** on a document to process it
- Or click **Process All** to extract text from all pending documents at once
- PDF and DOCX files have text extracted directly
- Image files (JPG, PNG, HEIC) use OCR (optical character recognition)

### Extraction Status

| Status | Meaning |
|--------|---------|
| Pending | Not yet processed |
| Processing... | Extraction in progress |
| Extracted (N pg) | Text successfully extracted from PDF/DOCX |
| OCR (N%) | Text extracted via OCR with confidence percentage |
| OCR — low (N%) | OCR completed but quality is low — review recommended |
| Failed | Extraction failed — see error message |

### OCR Warning

Documents processed with OCR always carry a warning: the extracted text may contain errors. This warning is preserved throughout the system — in the document list, in the analysis input, and in the final output.

### Include in Analysis

Each document has an **Include** toggle. Only documents with the toggle on AND successful extraction will be sent to the AI for analysis. You control what feeds the analysis.

### Document Type

Label each document with its type: Pleading, Evidence, Case Law, Statute, Correspondence, or Other. This helps the AI understand the role of each document.

### Text Preview

After extraction, a short preview of the extracted text appears on the document card. This lets you verify extraction quality without opening the file.

### Deleting Documents

Click **Delete** on any document card to remove it. The file is deleted from storage and the database record is removed.

---

## Running Analysis

### Prerequisites

- At least the 3 required intake sections must have content (Jurisdiction, Facts, Legal Objective)
- An OpenAI API key must be configured in the environment

### Choosing a Mode

Before clicking Run Analysis, select a mode from the dropdown next to the button:

| Mode | Purpose |
|------|---------|
| **Legal Memo** | Balanced analysis for internal review. Issues, governing law, application, counterarguments, research gaps. |
| **Litigation Strategy** | Strategic advocacy planning. Strongest arguments, expected attacks, procedural leverage, evidentiary needs. |
| **Case Comparison** | Compare your matter against one or more authorities. Factual similarities/differences, analogical usefulness. |
| **Draft Factum** | Draft a factum skeleton or argument section. Structured advocacy with careful citation handling. |

The default mode is **Legal Memo**.

### Running

Click **Run Analysis**. The button changes to "Analyzing..." while the AI processes your matter. This typically takes 30–90 seconds depending on the complexity of the intake and the number of included documents.

When complete, you are automatically taken to the Analysis tab.

### What Happens Behind the Scenes

1. Your intake data and included document excerpts are assembled into a structured prompt
2. The prompt is sent to the AI model with the legal copilot system instruction
3. The AI returns structured JSON matching a strict schema
4. The output is validated against the schema before being stored
5. If validation fails, the run is marked as failed with a useful error message

---

## Analysis — Reviewing Results

The Analysis tab shows the structured output from the AI.

### Layout

- **Left sidebar** — table of contents for quick navigation, authority summary stats, and export buttons
- **Main area** — the full analysis rendered as structured sections

### Sections

The analysis includes these sections (depending on mode and content):

| Section | Content |
|---------|---------|
| Matter Summary | How the AI understood your matter — jurisdiction, forum, posture, outcome |
| Issues to Decide | Identified legal issues with importance (high/medium/low) and status (live/uncertain/fact-dependent/research needed) |
| Governing Law | Legal rules and frameworks, each with a verification status |
| Authorities | All cited cases, statutes, and regulations with full metadata |
| Application to the Facts | Core analysis, strongest arguments, weaknesses, fact dependencies |
| Counterarguments | Arguments the opposing side is likely to make |
| Procedural Considerations | Procedural risks and strategic timing considerations |
| Missing Facts | Facts the AI identifies as needed but not provided |
| Research Gaps | Areas where further legal research is recommended |
| Recommended Next Steps | Actionable next steps |
| Confidence Assessment | How confident the AI is in the analysis, and what it depends on |
| Verification Status | Whether the analysis contains unverified points and needs human review |

### Understanding Verification Status

Every authority and governing law entry has a verification badge:

| Badge | Meaning |
|-------|---------|
| **verified** (green) | Authority was provided by you in the intake, or confirmed from a trusted source |
| **provisional** (amber) | Authority is likely real based on the AI's knowledge, but has not been independently confirmed |
| **unverified** (red) | Authority could not be confirmed — verify before citing |

### Authority Cards

Each cited authority shows:

- Case name and full citation
- Court, year, and jurisdiction
- Weight: binding, persuasive, contextual, or uncertain
- Treatment: supports, distinguishes, cuts against, or background only
- Relevance explanation
- Quoted text (only shown for verified authorities)
- Verification badge

### OCR Warning

If OCR-extracted documents were included in the analysis, an amber banner appears at the top: "This analysis includes OCR-extracted documents which may contain text errors."

### Warnings

The analysis may show validation warnings (amber banners) such as:
- "All authorities are unverified"
- "No authorities were cited"
- Verification count discrepancies

These are informational — the analysis still passed validation but has areas that need attention.

### Run Metadata

The top of the analysis shows: run number, model used, processing time, completion date, mode badge, and overall confidence level.

---

## Exporting

### Export PDF

Click **Export PDF** in the left sidebar of the Analysis tab. A professionally formatted PDF downloads immediately.

The PDF includes:

- Header with matter title, jurisdiction, forum, mode, and generation date
- "AI-ASSISTED DRAFT — VERIFY BEFORE RELIANCE" watermark
- All analysis sections with proper headings
- Authority cards with verification badges (color-coded)
- Issue cards with importance and status
- Confidence assessment and verification status
- Disclaimer footer
- Page numbers ("LawOps — AI-Assisted Draft — Page X of Y")

The PDF is formatted as a legal memo suitable for internal review.

### Print

Click **Print** in the left sidebar for a browser print dialog. The app chrome (sidebar, navigation) is hidden automatically. The analysis renders in a clean light theme suitable for printing.

---

## Matter Lifecycle

| Status | Meaning |
|--------|---------|
| **DRAFT** | New matter, no analysis run yet |
| **ACTIVE** | At least one analysis has been completed |
| **ARCHIVED** | Matter archived from the dashboard |

Matters transition from DRAFT to ACTIVE automatically when the first analysis completes successfully.

---

## Trust and Safety

### This Is Not Legal Advice

LawOps generates AI-assisted analysis. It is not a substitute for professional legal judgment. Every analysis includes:

- A persistent disclaimer: "AI-generated analysis. Verify all authorities before reliance."
- Verification badges on every authority (verified / provisional / unverified)
- A verification status section indicating whether human review is needed
- An "AI-ASSISTED DRAFT" watermark on exported PDFs

### Authority Verification

The AI may cite authorities it knows from training. These are marked **provisional** — they are likely real but have not been independently confirmed against a legal database. Always verify citations before relying on them.

Authorities you provide in the intake are marked **verified** because you supplied them.

### OCR Accuracy

Documents processed with OCR may contain text errors. The system labels OCR-derived text throughout the pipeline so you always know when extraction quality may be imperfect.

### What Is NOT Sent to the AI

- Your password or session information
- System configuration or file paths
- Data from other users' matters

### What IS Sent to the AI

- Your intake data (jurisdiction, facts, objective, authorities, etc.)
- Excerpts from included documents (first 3,000 characters per document)
- The analysis mode and behavioral constraints

---

## Keyboard Shortcuts

| Action | How |
|--------|-----|
| Navigate intake sections | Click section names in the left sidebar |
| Move to next/previous section | Click Next → or ← Previous at the bottom |
| Quick-create matter | Click + New Matter, type title, press Enter |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Run Analysis" button is disabled | Complete the 3 required intake sections (Jurisdiction, Facts, Legal Objective) |
| Analysis fails with "not configured" | The OpenAI API key is missing from the server configuration |
| Analysis fails with timeout | Try again — this is usually temporary |
| Analysis fails validation | The AI returned output that didn't match the expected format. Try again, possibly with a different mode. |
| Document extraction failed | The file may be scanned/image-based. For PDFs, try uploading individual pages as images for OCR. |
| OCR quality is low | The image may be blurry or low resolution. Try a clearer photo. |
| Buttons don't respond | Hard refresh the page (Cmd+Shift+R / Ctrl+Shift+R) |

---

## Account Information

- **Login**: Use the email and password provided by your administrator
- **Sign out**: Click "Sign out" in the bottom-left sidebar
- **Password reset**: Contact your administrator

---

*LawOps — Controlled Pilot v0.1*
*AI-generated analysis requires independent verification before reliance.*
