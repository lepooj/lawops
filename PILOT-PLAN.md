# LawOps — Controlled Pilot Plan

**Date:** 2026-04-01  
**Phase:** Controlled Pilot  
**Repo:** lepooj/lawops

---

## 1. Pilot Goal Definition

### Exact Goal

Build a working legal analysis application that a small number of Canadian lawyers can use with real matter information. The app collects structured legal context, runs it through a strong legal reasoning prompt, and returns organized, reviewable, exportable analysis — not chat output.

### What Success Looks Like

A lawyer sits down, opens the app, creates a matter for a real file they're working on, fills in the intake, runs analysis, and says:

> "This is structured the way I think about a case. The output is organized. I can see what it cited. I know what I need to verify. I can export this and start working from it."

That's it. Not "wow, AI." Just: "this is useful."

### What This Pilot Must Prove

1. **Structured intake produces better output than raw prompting.** The form collects what the model needs. The lawyer doesn't have to prompt-engineer.
2. **Structured output is more useful than a wall of text.** Sections, authorities, risk assessment — navigable, not scrollable.
3. **The review workflow earns trust.** Lawyers can see what's cited, what's uncertain, and what they've verified.
4. **The product feels serious enough to use with real matters.** Not a toy. Not a weekend project.

### What It Does NOT Need to Prove Yet

- That it works at scale (multi-tenant, thousands of users)
- That it replaces any existing legal tool
- That it integrates with DMS or practice management systems
- That it has a viable business model
- That it handles every area of Canadian law equally well
- That AI citations are automatically verifiable

---

## 2. Recommended Product Shape

### What This Pilot Should Be

A **single-purpose legal analysis workbench.** One workflow: intake → analysis → review → export.

The user opens a matter. Fills in structured legal context matching how they'd brief a colleague. Optionally attaches key documents. Runs analysis. Gets back a structured legal memorandum with sections they expect (issues, governing law, arguments, authorities, risk, strategy). Reviews it section by section. Exports a draft they can refine by hand.

### First User / First Job

**User:** Canadian litigation lawyer or senior paralegal with an active matter.  
**Job:** "I need a first-pass analysis of this case — issues, applicable law, arguments on both sides, risk assessment, and a procedural roadmap. I'd normally brief a junior or spend half a day on this myself."

### Why This Is the Right Narrow Wedge

- It maps directly to something lawyers already do (case analysis / strategy memo)
- The structured intake matches how lawyers organize case information
- The structured output matches the format of an actual legal memo
- It's high-value enough that "saving 3 hours" is immediately felt
- It's contained enough to build and ship fast

### What It Should Not Try to Be

| Not This                      | Why Not                                                            |
| ----------------------------- | ------------------------------------------------------------------ |
| Document Q&A tool             | Commodity. Everyone has one. Not differentiated.                   |
| Legal research assistant      | Research requires verified databases. We don't have them yet.      |
| Contract review/drafting tool | Different workflow, different users, different prompt engineering. |
| Multi-practice platform       | Focus on litigation first. Expand when validated.                  |
| Chatbot with legal knowledge  | The entire thesis is that structured > conversational.             |
| Team collaboration tool       | Single-user pilot. Teams come later.                               |

---

## 3. Exact Pilot Scope

### Must-Have

| Feature                                       | Why It's Non-Negotiable                                       |
| --------------------------------------------- | ------------------------------------------------------------- |
| Auth (email/password)                         | Real data needs real access control                           |
| Matter CRUD (create, list, open, archive)     | It's a workspace, not a one-shot tool                         |
| Structured intake form (6 sections)           | The core differentiator — what makes this not-a-chatbot       |
| Document upload with text extraction          | Lawyers bring documents. Must handle PDF and DOCX at minimum. |
| AI analysis generation                        | The product's reason to exist                                 |
| Structured analysis viewer (sectioned)        | Output must be navigable, not a text wall                     |
| Authority extraction with provenance labels   | Trust layer. AI-generated vs user-provided, confidence state. |
| Per-section review status                     | Lawyer marks sections as reviewed/flagged                     |
| PDF export with memo formatting               | Lawyers need to take something out of the app                 |
| Persistent "verify before reliance" messaging | Legal responsibility requires this                            |

### Nice-to-Have (Only If Time Allows)

| Feature                                               | Value                                     |
| ----------------------------------------------------- | ----------------------------------------- |
| Section-level refinement ("strengthen this argument") | Impressive. Shows iterative capability.   |
| Analysis run history (re-run with updated intake)     | Shows the product has memory              |
| Risk matrix visualization                             | Visual summary catches attention in demos |

### Explicit "Not in Pilot"

| Feature                        | Why Deferred                                                  |
| ------------------------------ | ------------------------------------------------------------- |
| Multi-user / teams / sharing   | Pilot is single-user per instance                             |
| Organization / tenant model    | One user = no orgs needed                                     |
| RBAC / roles                   | One user = one role                                           |
| 2FA / TOTP                     | Controlled pilot with known users                             |
| OCR for scanned documents      | Require text-based PDFs. OCR is a scope trap.                 |
| CanLII auto-verification       | Manual review labels are honest and sufficient                |
| Follow-up chat / Q&A threads   | Prove structured loop first                                   |
| DOCX export                    | PDF only. DOCX formatting is a rabbit hole.                   |
| Background job queue           | Everything runs inline or with simple async                   |
| Admin panel / settings UI      | Hardcode sensible defaults                                    |
| Citation link-out to databases | Just display the citation. User can search CanLII themselves. |
| Billing / subscriptions        | Not relevant                                                  |
| Mobile responsive              | Desktop-only. Lawyers use this at a desk.                     |

---

## 4. Exact End-to-End Workflow

### Sign In

```
Open app → clean login screen
  Dark theme. "LawOps" wordmark. No tagline.
  Email + password. Sign in.
  Redirect to dashboard.
```

### Dashboard — Matter List

```
┌─────────────────────────────────────────────────────────┐
│  LawOps                                    [user@firm] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Matters                            [+ New Matter]      │
│                                                         │
│  Title                    Jurisdiction  Status   Date   │
│  ─────────────────────────────────────────────────────  │
│  Singh v. Ontario MOT     ON Superior   Active   Mar 28 │
│  R. v. Patel              BC Provincial Draft    Mar 15 │
│  Chen Family Trust        AB QB         Archived Feb 20 │
│                                                         │
│  Showing 3 matters                                      │
└─────────────────────────────────────────────────────────┘

Pre-seed 1 complete matter with real analysis for immediate exploration.
```

### Create Matter

```
Click [+ New Matter]
  → Inline modal: Title + Matter type (Litigation / Regulatory / Advisory / Other)
  → Create → land on matter workspace, Intake tab active
```

### Structured Intake

The intake form has 6 sections. 3 are required. The form should feel like briefing a sharp colleague — not filling out a government form.

```
Progress rail (left):         Main area: current section form
  ✓ Jurisdiction
  ● Facts & Parties     ←     [Current section fields]
  ○ Legal Objective
  ○ Procedural History
  ○ Authorities
  ○ Documents

Bottom: [Save Draft]  [Next →]  [Run Analysis] (active when 3 required sections done)
```

**Section breakdown:**

| #   | Section                  | Required | Key Fields                                                                                                                  |
| --- | ------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Jurisdiction & Forum** | Yes      | Province/Territory (dropdown), Court level (dropdown), Federal/Provincial toggle, Area of law (searchable dropdown)         |
| 2   | **Facts & Parties**      | Yes      | Fact narrative (rich text, 5000 chars), Parties (structured: name + role)                                                   |
| 3   | **Legal Objective**      | Yes      | Desired outcome (text), Constraints (text, optional)                                                                        |
| 4   | **Procedural History**   | No       | Current stage (dropdown), Prior decisions (text), Key dates (date + event pairs)                                            |
| 5   | **Known Authorities**    | No       | Supporting precedents (case name + citation + why it matters), Opposing arguments (text), Opposing authorities (structured) |
| 6   | **Documents**            | No       | Drag-drop upload, document type label per file                                                                              |

**UX details that matter:**

- Placeholder text with realistic Canadian legal examples in every field
- Province dropdown auto-adjusts court level options
- Area of law is a searchable dropdown, not free text
- Required fields are obvious. Optional sections show "(optional)" without shame.
- Save draft works automatically — no data loss on navigation

### Attach Documents

```
Documents section:
  Drag-drop zone: "Drop PDF, DOCX, or TXT files here"
  Per-file row: filename | type badge (Pleading/Evidence/Case/Statute/Other) | size | extraction status
  Extraction: "Extracting..." → "✓ 28 pages extracted" or "⚠ Extraction failed"
  Max: 5 files, 25MB each
```

### Run Analysis

```
Click [Run Analysis]
  → Confirm: "Generate analysis from your intake? ~30-90 seconds."
  → [Generate]

  Progress (cosmetic staged steps over the actual wait):
  ┌────────────────────────────────────────────┐
  │  Generating Analysis                        │
  │                                             │
  │  ✓ Validating intake                        │
  │  ✓ Preparing context                        │
  │  ● Analyzing legal framework...             │
  │  ○ Structuring arguments                    │
  │  ○ Mapping authorities                      │
  │  ○ Assessing risk                           │
  └────────────────────────────────────────────┘

  On complete → auto-switch to Analysis tab
```

The staged progress is cosmetic (timed intervals during the single API call). It makes 45 seconds of waiting feel purposeful.

### Inspect Structured Output

```
Analysis tab:

  ┌─ Contents (sticky) ─┐  ┌─ Section view ──────────────────────┐
  │                      │  │                                     │
  │  1. Executive Assess.│  │  2. Issues to Decide                │
  │  2. Issues to Decide │  │  ════════════════════                │
  │  3. Governing Law    │  │                                     │
  │  4. Application      │  │  Summary: Three primary issues...   │
  │  5. Arguments For    │  │                                     │
  │  6. Counterarguments │  │  [Detailed analysis in serif font   │
  │  7. Procedural Strat.│  │   with inline citation markers¹     │
  │  8. Authority Map    │  │   that are clickable]               │
  │  9. Risk Analysis    │  │                                     │
  │  10. Work Product    │  │  Review: [Unreviewed ▾]             │
  │                      │  │                                     │
  │  3/10 reviewed       │  └─────────────────────────────────────┘
  └──────────────────────┘

  ⚖ AI-generated analysis. Verify all authorities before reliance.
```

Sections are collapsible. Each starts with a 2-sentence summary, then expandable detail. Legal content renders in a serif font. UI chrome in a sans-serif.

### Inspect Authorities

```
Click citation marker → slide-over panel:

  ┌────────────────────────────────────┐
  │  Authority Detail              [×] │
  │                                    │
  │  Dunsmuir v New Brunswick          │
  │  2008 SCC 9, [2008] 1 SCR 190     │
  │                                    │
  │  Court: Supreme Court of Canada    │
  │  Year: 2008                        │
  │                                    │
  │  Status: ■ UNVERIFIED              │
  │  Source: AI-generated              │
  │  ────────────────────────────────  │
  │  This citation has not been        │
  │  independently verified. Confirm   │
  │  before relying on it.             │
  │                                    │
  │  Used in: Section 3 (Governing Law)│
  │  Proposition: "Standard of review  │
  │  for administrative decisions..."  │
  │                                    │
  │  [Mark Verified ✓]  [Flag ⚠]     │
  └────────────────────────────────────┘
```

### Mark Review State

Each section has a dropdown: `Unreviewed` / `Reviewed ✓` / `Flagged ⚠`

The TOC shows progress: "3 of 10 sections reviewed"

This takes 2 seconds per section. It communicates: the product takes verification seriously, and so should you.

### Export

```
Click [Export]
  → Modal:
    Format: PDF
    Sections: [✓ All] or individual checkboxes
    Include confidence labels: [✓]
  → [Generate PDF]
  → Download

  PDF format:
    - Header: Matter title, date, "PREPARED WITH AI ASSISTANCE — VERIFY BEFORE RELIANCE"
    - Sections with proper headings
    - Authorities as footnotes
    - Confidence labels in margin notes
    - Serif typography, legal document spacing
    - Subtle watermark: "AI-ASSISTED DRAFT"
```

---

## 5. Minimum Information Architecture

### Screen Map

```
/login                      → Login
/dashboard                  → Matters list
/matters/[id]               → Matter workspace (tabbed)
  /matters/[id]/intake      → Structured intake form
  /matters/[id]/analysis    → Analysis viewer
  /matters/[id]/documents   → Document list + upload
```

That's **4 screens** (login, dashboard, and 3 tabs in the workspace). Export is a modal, not a screen.

### Per-Screen Detail

#### Login

- **Purpose:** Access control
- **Components:** Email field, password field, sign-in button, app wordmark
- **Actions:** Sign in
- **Omit:** Registration (pre-create accounts for pilot users), password reset (handle manually), OAuth

#### Dashboard

- **Purpose:** See all matters, create new ones, resume work
- **Components:** Matter table (title, jurisdiction, status, last activity), create button, status filter tabs (Active / Draft / Archived)
- **Actions:** Create matter, open matter, archive matter
- **Omit:** Search, sort, bulk actions, analytics

#### Matter Workspace — Intake Tab

- **Purpose:** Collect structured legal context
- **Components:** 6-section form, progress rail, save/next/run buttons
- **Actions:** Fill sections, save draft, navigate sections, trigger analysis
- **Omit:** Form templates, intake import, duplicate matter

#### Matter Workspace — Analysis Tab

- **Purpose:** Read, navigate, review, and export the AI analysis
- **Components:** Section TOC (sticky), section cards (collapsible, with summary + detail), inline citation markers, review dropdown per section, export button, footer disclaimer
- **Actions:** Expand/collapse sections, click citations, change review status, export PDF
- **Omit:** Side-by-side comparison, version history, section-level regeneration (nice-to-have)

#### Matter Workspace — Documents Tab

- **Purpose:** Upload and manage supporting documents
- **Components:** Upload zone (drag-drop), file list (name, type, size, extraction status), delete button per file
- **Actions:** Upload, label document type, delete
- **Omit:** In-app document preview (show filename + extraction status only), document versioning

#### Export Modal

- **Purpose:** Generate downloadable PDF
- **Components:** Section checkboxes, format confirmation (PDF only), generate button
- **Actions:** Select sections, generate, download
- **Omit:** DOCX, template selection, custom headers

---

## 6. AI Orchestration Design

### How the Legal CoPilot Prompt Is Used

The Canadian Legal Strategist CoPilot prompt is the **system message**. Used verbatim. Not edited. Not shown to users.

```
Messages to model:

[
  { role: "system",  content: "[Legal CoPilot prompt — verbatim]" },
  { role: "user",    content: "[Structured context built from intake]" }
]
```

One system prompt. One user message. One response. No multi-turn. No agent chains. No tool use. No retrieval augmentation.

### How Intake Becomes Model Input

The server constructs the user message by templating intake data into labeled sections with XML delimiters (for prompt injection resistance):

```
<matter_context>

JURISDICTION AND FORUM
Province/Territory: Ontario
Court Level: Superior Court of Justice
Jurisdiction Type: Provincial
Area of Law: Employment — Wrongful Dismissal

RELEVANT FACTS
[User's fact narrative, verbatim]

PARTIES
- Rajinder Singh (Plaintiff / Former Employee)
- Ontario Ministry of Transportation (Defendant / Employer)

DESIRED LEGAL OUTCOME
[User's desired outcome, verbatim]

CONSTRAINTS
[User's constraints, verbatim]

PROCEDURAL HISTORY
Current Stage: Pre-litigation
Prior Decisions: [User's text]
Key Dates:
- 2025-11-15: Termination
- 2026-01-10: Demand letter sent

KNOWN SUPPORTING AUTHORITIES
- Wilson v Atomic Energy of Canada Ltd, 2016 SCC 29: [User's relevance note]

KNOWN OPPOSING ARGUMENTS
[User's text]

</matter_context>

<uploaded_documents>

[Document: Statement of Claim Draft]
Type: Pleading
Content (excerpt):
[First 3000 characters of extracted text]

[Document: Termination Letter]
Type: Evidence
Content (excerpt):
[First 3000 characters of extracted text]

</uploaded_documents>

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

For each authority you cite, provide the full citation. Distinguish clearly between established law and novel arguments.
```

**Design decisions:**

- User input wrapped in `<matter_context>` and `<uploaded_documents>` delimiters — not in the system prompt
- Document text truncated (3000 chars per doc, max 5 docs) to fit context window and limit exposure
- The closing instruction specifies exact output sections so parsing is predictable
- Empty optional fields are omitted, not sent as blank

### Structured Output Enforcement

Parse the model's response server-side:

1. **Section splitting:** Regex on numbered headers (`## 1.`, `**1.`, `1.` etc.) — the closing instruction makes these predictable
2. **Citation extraction:** Regex for Canadian citation patterns:
   - Neutral: `2024 SCC 15`, `2023 ONCA 456`, `2022 BCSC 789`
   - Traditional: `[2008] 1 SCR 190`, `(1999), 45 OR (3d) 123`
   - Statutes: `RSC 1985, c C-46`, `SO 2000, c 41`
3. **Provenance labeling:**
   - If citation matches one the user provided in intake → `USER_PROVIDED`
   - If citation follows valid format → `UNVERIFIED` (honest default)
   - User can manually mark → `VERIFIED` or `FLAGGED`
4. **Fallback:** If section parsing fails, display raw output as a single "Full Analysis" section. Never show a blank screen.

### No Chatbot

There is no chat interface. No message history. No conversation thread.

The interaction model is: **fill form → press button → read structured output → review → export.**

If we add section refinement (nice-to-have), it's a single text input that regenerates one section. Not a conversation. The input clears after use.

### Refinement in Pilot?

**Recommendation: defer.** The structured intake → analysis → review → export loop is the core thesis. Refinement is valuable but adds:

- A second AI call pattern to build and test
- UX for scoped regeneration
- Section versioning

Build it only if the core loop is solid and there's time left. It's the strongest nice-to-have.

### Traceability

Every analysis run stores:

- The exact intake data used (snapshot, not a reference — intake can change later)
- The exact document excerpts included
- The prompt version identifier
- The model used
- Token counts
- Timestamp
- The raw model output (before parsing)

This means any analysis can be fully reconstructed: "This is exactly what was sent to the model and exactly what came back."

### Handling Uncertainty Honestly

The system prompt claims "zero hallucination." The product should not.

- Every AI-generated citation defaults to `UNVERIFIED`
- The analysis footer says: "AI-generated analysis. Authorities have not been independently verified."
- Sections where the model uses hedging language ("it could be argued," "there is limited precedent") get flagged with an amber confidence indicator
- The product never claims an authority is verified unless a human marked it so

---

## 7. Trust and Review Workflow

### Authority Display

Every cited authority in the analysis shows:

- Full citation text (case name, year, court, reporter)
- Which section(s) cite it
- What legal proposition it supports (extracted from context)
- Provenance label
- Review state

### Provenance Labels

| Label           | Meaning                                                    | Visual      |
| --------------- | ---------------------------------------------------------- | ----------- |
| `USER PROVIDED` | Lawyer entered this in intake                              | Blue badge  |
| `UNVERIFIED`    | AI-generated, not independently confirmed                  | Amber badge |
| `VERIFIED`      | Lawyer has confirmed this authority exists and is relevant | Green badge |
| `FLAGGED`       | Lawyer suspects this may be fabricated or misapplied       | Red badge   |

**Default for all AI-generated citations: `UNVERIFIED`.** This is the honest starting state.

### Per-Section Review

Each analysis section has a review state:

| State      | Meaning                                   | Visual                 |
| ---------- | ----------------------------------------- | ---------------------- |
| Unreviewed | Lawyer has not reviewed this section      | No indicator (default) |
| Reviewed ✓ | Lawyer has read and accepted this section | Green checkmark        |
| Flagged ⚠  | Lawyer wants to revisit or has concerns   | Amber warning          |

The table of contents shows: `4 of 10 sections reviewed`

### How a Lawyer Marks Review

A dropdown on each section header: `[Unreviewed ▾]` → click → select state. One click. No modal. No confirmation dialog.

For authorities: `[Mark Verified]` and `[Flag]` buttons in the citation detail panel.

### Export Warnings

When exporting with unreviewed sections:

```
"3 sections are unreviewed. Export anyway?"
[Export All]  [Export Reviewed Only]  [Cancel]
```

The exported PDF marks unreviewed sections with a margin note: "NOT YET REVIEWED"

### Communicating "Review Required" Without Weakness

**The principle:** State facts, don't apologize.

| Weak (avoid)                       | Strong (use)                                                        |
| ---------------------------------- | ------------------------------------------------------------------- |
| "Warning: This may contain errors" | "3 authorities require verification"                                |
| "AI cannot provide legal advice"   | "Verify all authorities before reliance"                            |
| "This is just a suggestion"        | "Based on [Authority], the strongest argument is..."                |
| "I'm not confident about this"     | "Limited precedent in this area — independent research recommended" |

The product should feel like a sharp junior who does good work but flags what they're unsure about. Not like a tool that's constantly disclaiming its own usefulness.

### No Fake Confidence Theater

- Do NOT use percentage confidence scores (e.g., "87% confident"). They're meaningless and misleading.
- Do NOT use star ratings or colored meters. Lawyers will see through it.
- DO use three states: `UNVERIFIED` / `VERIFIED` / `FLAGGED`. Simple, honest, actionable.
- DO let the lawyer make the final call on every authority and every section.

---

## 8. Minimum Serious Security Plan

### Deployment Model

**Recommended for pilot: Private hosted instance.** A single VPS (or local Docker) accessible only to pilot participants. Not public internet. Either:

- **Option A (simplest):** Docker Compose on a VPS behind a VPN or IP allowlist. Pilot users connect via direct URL.
- **Option B (local):** Each pilot user runs Docker Compose locally. Zero network exposure. Most secure.

For a controlled pilot with < 10 lawyers, Option A (single private VPS) is the right balance. Option B if any participant insists on zero cloud exposure.

### Mandatory Security Controls

| Control                        | Implementation                                                                                                 | Rationale                                                       |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **Server-side LLM calls only** | API key in `.env`, all model calls from server actions, key never in client bundle                             | Non-negotiable. Key leak = billing exposure + data access.      |
| **Authentication**             | Email/password, bcrypt 12 rounds, JWT sessions (8-hour), httpOnly + Secure + SameSite=Strict cookies           | Real data needs real access control. Pre-create pilot accounts. |
| **Matter isolation**           | Every DB query scoped by `userId`. User A cannot see User B's matters.                                         | Fundamental. Even in a small pilot.                             |
| **Input validation**           | Zod schemas on every server action input                                                                       | Prevents malformed data, stored XSS.                            |
| **File upload safety**         | Extension allowlist (PDF, DOCX, TXT only), server-side MIME validation, 25MB limit, UUID filenames             | Prevents executable upload, path traversal, storage abuse.      |
| **CSP headers**                | Strict Content-Security-Policy with nonces                                                                     | XSS mitigation.                                                 |
| **No sensitive data in logs**  | Log action types + metadata only. Never log: matter content, facts, analysis output, document text, passwords. | Legal data in logs = uncontrolled exposure.                     |
| **Prompt injection controls**  | User content in XML-delimited sections within user message. Never in system prompt.                            | Prevents intake data from overriding AI behavior.               |
| **HTTPS**                      | TLS cert via Let's Encrypt if hosted.                                                                          | Legal data must not traverse the network in plaintext.          |
| **SQL injection prevention**   | Prisma ORM only, no raw SQL                                                                                    | ORM parameterizes all queries automatically.                    |

### What Should NOT Be Sent to the Model

- User passwords or session tokens
- Internal system configuration or file paths
- Other users' data (enforce at the query layer, not just the prompt layer)
- The system prompt should not echo in output — if detected, strip it server-side

### What Should NOT Be Logged

- Matter content (facts, arguments, desired outcomes)
- Analysis output (raw or parsed)
- Document text (extracted or original)
- Full prompts sent to the model
- Full model responses
- Passwords or tokens

### What SHOULD Be Logged

- Action types: `matter.created`, `analysis.run`, `document.uploaded`, `export.generated`
- Metadata: userId, matterId, timestamp, model used, token count, latency
- Errors: stack traces (scrubbed of user content), error codes
- Auth events: login success/failure (no passwords)

### Least-Data-to-Model Principle

- Send only the data needed for analysis. Don't send the user's email, session info, or system metadata.
- Truncate document text (3000 chars per doc). Don't send entire 50-page PDFs.
- Omit empty optional fields. Don't send `"Procedural History: None provided"` — just omit the section.

### Provider Data Controls

- **OpenAI:** Review the OpenAI API data usage policy (API inputs/outputs are not used for training by default as of current policy). Confirm this and communicate to pilot participants.
- **Document to provide pilot users:** A one-page summary of what data is sent to the model provider, what the provider's retention/training policy is, and what stays on-server.
- If a pilot participant requires zero external API calls, the pilot cannot serve them without a self-hosted model (out of scope).

### What Can Wait

| Control                       | Why It Can Wait                                                     |
| ----------------------------- | ------------------------------------------------------------------- |
| 2FA / TOTP                    | < 10 known users, controlled access                                 |
| RBAC / role system            | Single-user-per-login, no roles needed                              |
| Encryption at rest (DB-level) | Local/VPS deployment with disk encryption at OS level is sufficient |
| Malware scanning              | Pilot files are from trusted users. Add before broader access.      |
| Rate limiting                 | < 10 users won't self-DDoS. Add before any public access.           |
| Audit log viewer UI           | Log to DB, build viewer later                                       |
| Idle session timeout          | Controlled pilot, not a public app                                  |
| Document quarantine pipeline  | Type + size validation is sufficient for trusted users              |

---

## 9. Recommended Technical Architecture

### One Stack

| Layer               | Choice                                          | Why                                                                                            |
| ------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Framework**       | Next.js 15 (App Router) + React 19 + TypeScript | Server components + server actions = no separate API layer. Fastest to build.                  |
| **Styling**         | Tailwind CSS v4 + Radix UI primitives           | Fast to build, accessible, dark-theme ready. Proven.                                           |
| **Rich text input** | Tiptap (ProseMirror)                            | Best React rich text editor. Needed for fact narrative field.                                  |
| **Forms**           | React Hook Form + Zod                           | Multi-section intake form with validation. Handles complexity well.                            |
| **Database**        | PostgreSQL 17 via Prisma ORM                    | Relational data. JSONB for flexible fields. Type-safe queries.                                 |
| **Auth**            | NextAuth v5 (credentials provider)              | JWT sessions, bcrypt, minimal setup.                                                           |
| **File storage**    | Local filesystem (`./data/uploads/`)            | No S3 for pilot. One storage module to swap later.                                             |
| **Text extraction** | `pdf-parse` (PDF) + `mammoth` (DOCX)            | Lightweight. In-process. No external services.                                                 |
| **AI provider**     | OpenAI GPT-5.4 (ChatGPT API)                    | Strong legal reasoning. Large context window. Proven structured output. Widely understood API. |
| **PDF export**      | `@react-pdf/renderer`                           | React-native PDF generation. Fast, no headless browser needed.                                 |
| **Deployment**      | Docker Compose (Next.js + PostgreSQL)           | One command: `docker compose up`.                                                              |

### Architecture

```
┌──────────────────────────────────────────────┐
│  Browser (localhost:3000 or pilot.domain)     │
│  Next.js — React client components            │
└──────────────────┬───────────────────────────┘
                   │ Server Actions
┌──────────────────▼───────────────────────────┐
│  Next.js Server                               │
│                                               │
│  ┌─────────────┐ ┌─────────────┐ ┌────────┐ │
│  │ Server      │ │ Prompt      │ │ File   │ │
│  │ Actions     │ │ Builder +   │ │ Upload │ │
│  │ (CRUD)      │ │ Output      │ │ + Text │ │
│  │             │ │ Parser      │ │ Extract│ │
│  └──────┬──────┘ └──────┬──────┘ └───┬────┘ │
│         │               │             │      │
│  ┌──────▼──────┐ ┌──────▼──────┐ ┌───▼────┐ │
│  │ Prisma      │ │ OpenAI      │ │ Local  │ │
│  │ ORM         │ │ API         │ │ FS     │ │
│  └──────┬──────┘ └─────────────┘ └────────┘ │
└─────────┼────────────────────────────────────┘
          │
┌─────────▼──────┐
│ PostgreSQL 17   │
│ (Docker)        │
└────────────────┘
```

### Do We Need Background Jobs?

**No.** For the pilot:

- Text extraction (pdf-parse, mammoth) runs in < 5 seconds for reasonable documents. Do it inline on upload.
- AI analysis takes 30-90 seconds. The user waits with a progress indicator. This is acceptable.
- PDF export takes < 5 seconds. Inline.

Add a job queue only if extraction or export becomes slow enough to block the UI. Not before.

---

## 10. Minimum Data Model

### Required Pilot Entities

#### User

| Field        | Type     | Notes        |
| ------------ | -------- | ------------ |
| id           | UUID     | PK           |
| email        | String   | Unique       |
| passwordHash | String   | bcrypt       |
| name         | String   | Display name |
| createdAt    | DateTime |              |

#### Matter

| Field      | Type     | Notes                                       |
| ---------- | -------- | ------------------------------------------- |
| id         | UUID     | PK                                          |
| userId     | UUID     | FK → User. **Every query filters on this.** |
| title      | String   |                                             |
| matterType | Enum     | LITIGATION, REGULATORY, ADVISORY, OTHER     |
| status     | Enum     | DRAFT, ACTIVE, ARCHIVED                     |
| createdAt  | DateTime |                                             |
| updatedAt  | DateTime |                                             |

#### MatterIntake

| Field                 | Type     | Notes                                        |
| --------------------- | -------- | -------------------------------------------- |
| id                    | UUID     | PK                                           |
| matterId              | UUID     | FK → Matter (unique, 1:1)                    |
| jurisdiction          | JSON     | `{ province, courtLevel, jurisdictionType }` |
| areaOfLaw             | String   |                                              |
| facts                 | Text     | Rich text                                    |
| parties               | JSON     | `[{ name, role }]`                           |
| desiredOutcome        | Text     |                                              |
| constraints           | Text?    |                                              |
| proceduralStage       | String?  |                                              |
| priorDecisions        | Text?    |                                              |
| keyDates              | JSON?    | `[{ date, event }]`                          |
| supportingAuthorities | JSON?    | `[{ caseName, citation, relevance }]`        |
| opposingArguments     | Text?    |                                              |
| opposingAuthorities   | JSON?    | `[{ caseName, citation, relevance }]`        |
| updatedAt             | DateTime |                                              |

#### Document

| Field            | Type     | Notes                                        |
| ---------------- | -------- | -------------------------------------------- |
| id               | UUID     | PK                                           |
| matterId         | UUID     | FK → Matter                                  |
| userId           | UUID     | FK → User                                    |
| originalFilename | String   |                                              |
| storagePath      | String   | UUID-based path on local FS                  |
| mimeType         | String   |                                              |
| fileSize         | Int      | bytes                                        |
| documentType     | Enum     | PLEADING, EVIDENCE, CASE_LAW, STATUTE, OTHER |
| extractedText    | Text?    |                                              |
| extractionStatus | Enum     | PENDING, COMPLETE, FAILED                    |
| uploadedAt       | DateTime |                                              |

#### AnalysisRun

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
| model            | String    | e.g., "gpt-5.4"                        |
| inputTokens      | Int       |                                        |
| outputTokens     | Int       |                                        |
| latencyMs        | Int       |                                        |
| startedAt        | DateTime  |                                        |
| completedAt      | DateTime? |                                        |

#### AnalysisSection

| Field        | Type   | Notes                                                   |
| ------------ | ------ | ------------------------------------------------------- |
| id           | UUID   | PK                                                      |
| runId        | UUID   | FK → AnalysisRun                                        |
| sectionKey   | String | e.g., `executive_assessment`, `issues`, `governing_law` |
| sectionOrder | Int    |                                                         |
| title        | String | Display heading                                         |
| summary      | Text   | 2-3 sentence summary                                    |
| content      | Text   | Full section content                                    |
| reviewStatus | Enum   | UNREVIEWED, REVIEWED, FLAGGED                           |

#### Citation

| Field              | Type    | Notes                         |
| ------------------ | ------- | ----------------------------- |
| id                 | UUID    | PK                            |
| runId              | UUID    | FK → AnalysisRun              |
| sectionId          | UUID    | FK → AnalysisSection          |
| citationText       | String  | Full citation string          |
| caseName           | String? |                               |
| year               | Int?    |                               |
| court              | String? |                               |
| propositionUsedFor | Text?   | What legal point it supports  |
| source             | Enum    | AI_GENERATED, USER_PROVIDED   |
| verificationStatus | Enum    | UNVERIFIED, VERIFIED, FLAGGED |

### Defer to Later

| Entity                        | Why Deferred                                                   |
| ----------------------------- | -------------------------------------------------------------- |
| Organization / Membership     | No multi-user orgs in pilot                                    |
| PromptVersion (as DB entity)  | Version in code, record version string on AnalysisRun          |
| RefinementThread / Messages   | No chat in pilot                                               |
| ExportArtifact (as DB entity) | Generate on-demand, don't persist exports                      |
| AuditEvent (as DB entity)     | Log to structured file/stdout for pilot. DB audit table later. |
| AccessPolicy / Permissions    | userId scoping is sufficient                                   |

---

## 11. Exact Build Order

### Phase 1: Foundation (Days 1-3)

**What gets built:**

- Next.js 15 + TypeScript + Tailwind v4 + Radix UI project init
- Prisma schema for all pilot entities
- PostgreSQL via Docker Compose
- NextAuth v5 with credentials provider
- Login page
- App shell layout (dark theme, minimal sidebar, header with user info)
- Seed script: 1 demo user account

**Why:** Nothing else can start until auth and DB work. The layout shell sets the visual tone immediately.

**Unlocks:** Everything else.

**Risk reduced:** "Can I build and run this thing at all?"

### Phase 2: Matter Management (Days 4-6)

**What gets built:**

- Dashboard page with matter table
- Create matter modal
- Matter workspace layout with 3 tab navigation (Intake / Analysis / Documents)
- Matter status management (Draft / Active / Archive)
- Basic empty states for each tab

**Why:** The workspace is the product's home. Getting this right early sets the UX tone.

**Unlocks:** All three workspace tabs can be built independently.

**Risk reduced:** "Does the information architecture feel right?"

### Phase 3: Intake Form (Days 7-11)

**What gets built:**

- 6-section intake form with React Hook Form + Zod validation
- Section progress rail
- Auto-save draft (debounced server action)
- All field types: dropdowns, structured inputs (parties, dates, authorities), rich text (Tiptap for facts)
- Province → court level cascading dropdowns
- Searchable area-of-law dropdown
- "Ready for Analysis" activation when 3 required sections are complete

**Why:** This is the core differentiator. A sloppy intake form means sloppy AI input means the thesis fails.

**Unlocks:** Analysis generation (needs intake data to send to model).

**Risk reduced:** "Is the intake form natural for lawyers or does it feel like a chore?"

### Phase 4: Document Upload (Days 12-13)

**What gets built:**

- Upload API route (extension allowlist, MIME check, size limit, UUID filename)
- Drag-drop upload component
- Text extraction (pdf-parse for PDF, mammoth for DOCX, direct read for TXT)
- File list with type badge, size, extraction status
- Delete file

**Why:** Lawyers bring documents. The app must handle them. But keep it simple — upload, extract, show status.

**Unlocks:** Document text can be included in analysis prompt.

**Risk reduced:** "Can the app handle the files lawyers actually have?"

### Phase 5: Analysis Generation (Days 14-18)

**What gets built:**

- Prompt builder: intake + document excerpts → structured user message
- OpenAI API client (server-side, API key from env)
- "Run Analysis" button with confirmation
- Staged progress UI
- Raw output storage in AnalysisRun
- Output parser: split response into sections
- Citation extractor: regex for Canadian citations, classify as USER_PROVIDED or UNVERIFIED
- Parsed sections + citations stored in DB
- Fallback: if parsing fails, single "Full Analysis" section with raw output

**Why:** This is the product. If the analysis pipeline doesn't work, nothing else matters.

**Unlocks:** Analysis viewer (needs data to display).

**Risk reduced:** "Does the AI produce structured, useful output from our prompt + intake?"

### Phase 6: Analysis Viewer (Days 19-23)

**What gets built:**

- Sectioned analysis view with sticky TOC
- Collapsible sections (summary + expandable detail)
- Inline citation markers (superscript, clickable)
- Citation detail slide-over panel (full citation, provenance badge, proposition, verify/flag buttons)
- Per-section review dropdown (Unreviewed / Reviewed / Flagged)
- Review progress counter in TOC
- Footer disclaimer: "AI-generated analysis. Verify all authorities before reliance."
- Serif font for analysis content (Source Serif 4), sans-serif for UI

**Why:** This is the value delivery surface. If it looks like a markdown dump, the pilot fails. If it looks like a structured legal memo with navigation and review controls, the pilot succeeds.

**Unlocks:** Export (needs the same data, different format).

**Risk reduced:** "Does the output feel like a legal analysis or like AI slop?"

### Phase 7: Export + Polish (Days 24-28)

**What gets built:**

- Export modal (section selection, generate button)
- PDF generation with: header, sections, footnotes for authorities, confidence labels, watermark, serif typography
- Export warning for unreviewed sections
- Seed data: 1-2 pre-seeded matters with complete intake + real AI analysis
- Polish: loading states everywhere, error states, empty states, consistent spacing, page titles
- Docker Compose build verification on clean machine

**Why:** Export is the tangible takeaway. Polish is what separates "impressive" from "weekend project."

**Unlocks:** Pilot-ready application.

**Risk reduced:** "Does the exported PDF look like a real legal document?"

### Total: ~28 days of focused building.

---

## 12. Biggest Risks

### 1. Analysis Output Looks Like ChatGPT

**Why it matters:** If a lawyer looks at the analysis tab and thinks "I could have just asked ChatGPT directly," the pilot fails.  
**Mitigation:** The output parser MUST produce clearly sectioned, navigable output. Invest heavily in the analysis viewer. Serif font. Section headers. Collapsible detail. Inline citations. If it looks like a markdown blob, rebuild it.

### 2. Fabricated Citations

**Why it matters:** A lawyer recognizes a fake case. Trust is instantly destroyed.  
**Mitigation:** Every AI-generated citation defaults to `UNVERIFIED` with an amber badge. The product never claims a citation is real. The trust message: "We surface what the model cites. You verify. Here's how." Honesty > theater.

### 3. Intake Form Friction

**Why it matters:** If the lawyer fills two fields and gives up, they never see the analysis.  
**Mitigation:** Only 3 sections required. Smart placeholder text with real legal examples. Auto-save so nothing is lost. Optional sections clearly marked. The form should feel like briefing a colleague, not filing paperwork.

### 4. 60-Second Wait Feels Broken

**Why it matters:** A loading spinner for a minute makes the app feel dead.  
**Mitigation:** Staged progress UI. Named steps appearing over time. The wait feels purposeful. "Analyzing jurisdiction..." → "Structuring arguments..." → "Mapping authorities..."

### 5. PDF Export Looks Cheap

**Why it matters:** The exported document is what the lawyer takes away. If it looks like a web page printout, the product feels amateur.  
**Mitigation:** Serif font, proper margins, section headings, authorities as footnotes, watermark, professional header. It should look like something that could sit in a legal file.

### 6. Scope Creep Prevents Shipping

**Why it matters:** Adding OCR, CanLII verification, chat threads, DOCX export, and admin panels means the core loop never ships.  
**Mitigation:** This document. The scope is locked. Follow the build order. Nothing ships until intake → analysis → review → export works.

### 7. API Key Leaks to Client

**Why it matters:** If the OpenAI API key is visible in the browser, it's a billing and data security incident.  
**Mitigation:** All AI calls via server actions. API key in `.env` only. Verify by checking browser DevTools network tab — zero requests to `api.openai.com` should appear.

### 8. Pilot User Enters Real Privileged Data and Worries

**Why it matters:** If a lawyer enters real client data and then asks "where does this go?" and we don't have a clear answer, trust is gone.  
**Mitigation:** Before pilot launch, provide a one-page data handling summary: what's stored locally, what's sent to OpenAI, OpenAI's API data policy (not used for training by default), what's logged and what isn't. Transparency > reassurance.

---

## 13. Final Recommendation

### The Exact Pilot to Build

A locally-deployed or private-hosted legal analysis workbench where a lawyer can:

1. Sign in
2. Create and manage matters
3. Enter structured legal context (jurisdiction, facts, objective, authorities, documents)
4. Run AI analysis using the Canadian Legal Strategist CoPilot prompt
5. Review sectioned output with extracted authorities and provenance labels
6. Mark sections as reviewed or flagged
7. Export a professional PDF memo draft

### The Exact Scope

| In                                               | Out                                   |
| ------------------------------------------------ | ------------------------------------- |
| Auth (email/password, pre-created accounts)      | Registration flow, OAuth, 2FA         |
| Matter CRUD + status lifecycle                   | Multi-user, teams, sharing, org model |
| 6-section structured intake with auto-save       | Intake templates, matter cloning      |
| Document upload (PDF/DOCX/TXT) + text extraction | OCR, document preview, versioning     |
| AI analysis (single-call, structured prompt)     | Chat, refinement, multi-turn          |
| 10-section analysis viewer with TOC              | Version history, side-by-side diff    |
| Citation extraction + provenance labels          | Auto-verification, database lookups   |
| Per-section review status                        | Paragraph-level review, annotation    |
| PDF export with legal formatting                 | DOCX, template customization          |
| Trust messaging + disclaimers                    | Confidence percentages, risk scores   |

### The Exact Security Minimum Bar

- Server-side only AI calls, API key in env
- bcrypt auth, JWT sessions, secure cookies
- userId scoping on every query
- Zod input validation on all server actions
- File upload allowlist + MIME check + UUID naming
- CSP headers with nonces
- No sensitive data in logs
- Prompt injection controls (XML-delimited user input)
- HTTPS if hosted beyond localhost
- Data handling transparency doc for pilot participants

### The Exact Technical Stack

| Layer           | Choice                             |
| --------------- | ---------------------------------- |
| Frontend        | Next.js 15 + React 19 + TypeScript |
| Styling         | Tailwind CSS v4 + Radix UI         |
| Rich text       | Tiptap                             |
| Forms           | React Hook Form + Zod              |
| Database        | PostgreSQL 17 + Prisma             |
| Auth            | NextAuth v5 (credentials)          |
| File storage    | Local filesystem                   |
| Text extraction | pdf-parse + mammoth                |
| AI              | OpenAI GPT-5.4 (ChatGPT API)       |
| PDF export      | @react-pdf/renderer                |
| Deployment      | Docker Compose                     |

### Top 10 Decisions to Lock First

| #   | Decision                        | Answer                                                                                                                                                                 |
| --- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | AI model                        | OpenAI GPT-5.4 via ChatGPT API                                                                                                                                         |
| 2   | Output sections                 | 10: Executive Assessment, Issues, Governing Law, Application, Arguments For, Counterarguments, Procedural Strategy, Authority Map, Risk Analysis, Work Product Support |
| 3   | Intake sections                 | 6 sections, 3 required (Jurisdiction, Facts, Objective)                                                                                                                |
| 4   | Citation confidence model       | 4 states: USER_PROVIDED, UNVERIFIED, VERIFIED, FLAGGED                                                                                                                 |
| 5   | Review model                    | 3 states per section: Unreviewed, Reviewed, Flagged                                                                                                                    |
| 6   | No chat interface               | Structured intake → structured output. No conversation.                                                                                                                |
| 7   | Dark theme, serif legal content | Source Serif 4 for analysis. Inter for UI.                                                                                                                             |
| 8   | PDF export only                 | No DOCX.                                                                                                                                                               |
| 9   | Single-user per instance        | No orgs, no roles, no sharing for pilot.                                                                                                                               |
| 10  | Docker Compose deployment       | Local or single VPS. No cloud platform.                                                                                                                                |

---

_Build this in 4 weeks. Put it in front of a lawyer. Watch what they do. Then decide what's next._
