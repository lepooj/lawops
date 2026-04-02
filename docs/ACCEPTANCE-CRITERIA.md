# Acceptance Criteria

## Core Workflow: End-to-End

A pilot-ready application means a lawyer can complete this full loop:

1. **Login** with pre-created credentials
2. **See dashboard** with matter list (or empty state)
3. **Create a matter** with title and type
4. **Fill intake** — at minimum the 3 required sections (Jurisdiction, Facts, Objective)
5. **Upload a document** (PDF or DOCX) and see extraction succeed
6. **Run analysis** and see staged progress for 30-90 seconds
7. **View 10 analysis sections** with navigable TOC
8. **Click a citation** and see provenance badge + proposition in slide-over
9. **Mark a section** as Reviewed or Flagged
10. **Mark a citation** as Verified or Flagged
11. **Export PDF** that looks like a professional legal memo
12. **See disclaimer** on every analysis and every export

If any step in this loop is broken, the pilot is not ready.

## Per-Feature Acceptance

### Authentication

- [ ] Login works with email/password
- [ ] Invalid credentials show clear error
- [ ] Unauthenticated access redirects to login
- [ ] Session persists across page refreshes (up to 8 hours)
- [ ] Logging out clears session

### Matter Management

- [ ] Create matter with title + type
- [ ] Matter list shows title, jurisdiction, status, last updated
- [ ] Filter by status (Active / Draft / Archived)
- [ ] Archive and unarchive matters
- [ ] Cannot see another user's matters

### Structured Intake

- [ ] All 6 sections render with correct fields
- [ ] Province dropdown changes court level options
- [ ] Area of law is searchable
- [ ] Rich text editor works for fact narrative
- [ ] Parties can be added/removed (name + role)
- [ ] Auto-save persists on blur
- [ ] Progress rail reflects section completion
- [ ] Required sections enforced before analysis

### Document Upload

- [ ] Drag-drop and click-to-upload both work
- [ ] Accepts PDF, DOCX, TXT only
- [ ] Rejects other file types with clear message
- [ ] Rejects files > 25MB
- [ ] Text extraction completes for each format
- [ ] Extraction failure shows status (not a hard error)
- [ ] Document type can be set (Pleading / Evidence / etc.)
- [ ] Delete removes file

### Analysis Generation

- [ ] "Run Analysis" button active only when intake is ready
- [ ] Confirmation before generating
- [ ] Staged progress UI during wait
- [ ] Output parsed into 10 sections
- [ ] Citations extracted with provenance labels
- [ ] If parsing fails, raw output shown as fallback
- [ ] AnalysisRun stores full trace (input snapshot, raw output, tokens, timing)

### Analysis Viewer

- [ ] 10 sections with sticky TOC
- [ ] Sections collapsible (summary + detail)
- [ ] Serif font for legal content
- [ ] Inline citation markers (clickable)
- [ ] Review dropdown per section (Unreviewed / Reviewed / Flagged)
- [ ] Progress counter: "X of 10 reviewed"
- [ ] Footer: "AI-generated analysis. Verify all authorities before reliance."

### Citation Detail

- [ ] Slide-over panel on citation click
- [ ] Shows: full citation, court, year, provenance badge, proposition
- [ ] "Mark Verified" and "Flag" buttons work
- [ ] Badge updates immediately

### PDF Export

- [ ] Section selection in modal
- [ ] Warning if unreviewed sections
- [ ] PDF has: header, matter title, date, sections, footnotes for authorities
- [ ] Confidence labels in margin or footnotes
- [ ] Watermark: "AI-ASSISTED DRAFT"
- [ ] Header: "PREPARED WITH AI ASSISTANCE — VERIFY BEFORE RELIANCE"
- [ ] Serif typography, legal document spacing

### Security Minimum

- [ ] OpenAI API key never visible in browser (check DevTools network)
- [ ] Cannot access another user's matters via URL manipulation
- [ ] File upload rejects non-allowed types
- [ ] No sensitive data in server logs
- [ ] CSP headers present on responses
- [ ] Passwords hashed with bcrypt (not stored in plaintext)

### Visual Quality

- [ ] Dark theme consistent throughout
- [ ] Loading states on all async operations
- [ ] Error states that explain what happened
- [ ] Empty states that guide forward
- [ ] No unstyled/broken layouts
- [ ] Professional enough that a lawyer would use it with real matter data

## What "Done" Means

The pilot is shippable when:

1. The full workflow loop completes without errors
2. All per-feature acceptance criteria pass
3. A pre-seeded demo matter with complete analysis is available for immediate exploration
4. `docker compose up` works on a clean machine
5. Data handling summary document exists for pilot participants
