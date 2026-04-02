# Build Order

## Phase 1: Foundation (Days 1-3)

**What:**

- Next.js 15 + TypeScript + Tailwind v4 + Radix UI project initialization
- Prisma schema for all 7 pilot entities
- PostgreSQL via Docker Compose
- NextAuth v5 with credentials provider
- Login page (dark theme)
- App shell layout (sidebar, header with user info)
- Seed script with 1 demo user
- Middleware for CSP headers

**Unlocks:** Everything else.

**Deliverables:**

- [ ] `npm run dev` starts without errors
- [ ] Login works with seeded user
- [ ] App shell renders (sidebar, header, dark theme)
- [ ] `npm run type-check` passes
- [ ] `npm run test` passes
- [ ] Database migrations apply cleanly

## Phase 2: Matter Management (Days 4-6)

**What:**

- Dashboard page with matter table
- Create matter modal (title + matter type)
- Matter workspace layout with 3 tab navigation
- Matter status management (Draft / Active / Archive)
- Empty states for each tab

**Unlocks:** All three workspace tabs can be built independently.

**Deliverables:**

- [ ] Dashboard shows matters list with status filter tabs
- [ ] Create matter creates record and navigates to workspace
- [ ] Tab navigation between Intake / Analysis / Documents works
- [ ] Archive/unarchive works
- [ ] Empty states render correctly

## Phase 3: Intake Form (Days 7-11)

**What:**

- 6-section form with React Hook Form + Zod
- Section progress rail
- Auto-save draft (debounced server action)
- All field types: dropdowns, structured inputs, Tiptap rich text
- Province → court level cascading
- Searchable area-of-law dropdown
- "Run Analysis" activates when 3 required sections complete

**Unlocks:** Analysis generation.

**Deliverables:**

- [ ] All 6 sections render with correct field types
- [ ] Province dropdown adjusts court level options
- [ ] Auto-save persists on blur/navigation
- [ ] Progress rail reflects completion state
- [ ] "Run Analysis" button enables at correct time
- [ ] Validation prevents incomplete required sections

## Phase 4: Document Upload (Days 12-13)

**What:**

- Upload API route (allowlist, MIME, size, UUID)
- Drag-drop upload component
- Text extraction (pdf-parse, mammoth, direct read)
- File list with type badges and extraction status
- Delete file

**Unlocks:** Document text in analysis prompt.

**Deliverables:**

- [ ] Upload accepts PDF, DOCX, TXT; rejects others
- [ ] Text extraction works for each format
- [ ] File list shows status, type badge, size
- [ ] Delete removes file from disk and DB
- [ ] Extraction failure shows status (non-fatal)

## Phase 5: Analysis Generation (Days 14-18)

**What:**

- Prompt builder: intake + document excerpts → user message
- OpenAI API client (server-side)
- "Run Analysis" with confirmation
- Staged progress UI (cosmetic steps during wait)
- Raw output storage in AnalysisRun
- Output parser: split into 10 sections
- Citation extractor: Canadian patterns, provenance assignment
- Parsed sections + citations stored in transaction
- Fallback: single "Full Analysis" section if parsing fails

**Unlocks:** Analysis viewer.

**Deliverables:**

- [ ] Analysis generates from intake data
- [ ] Progress UI shows during 30-90 second wait
- [ ] Output splits into 10 sections correctly
- [ ] Citations extracted with correct provenance labels
- [ ] AnalysisRun stores complete trace data
- [ ] Fallback works when parsing fails

## Phase 6: Analysis Viewer (Days 19-23)

**What:**

- Sectioned view with sticky TOC
- Collapsible sections (summary + detail)
- Inline citation markers (superscript, clickable)
- Citation detail slide-over panel
- Per-section review dropdown
- Review progress counter
- Footer disclaimer
- Serif font for legal content

**Unlocks:** Export.

**Deliverables:**

- [ ] 10 sections render with TOC navigation
- [ ] Sections collapse/expand
- [ ] Citation markers link to slide-over
- [ ] Review status persists per section
- [ ] Progress counter updates in TOC
- [ ] Serif font renders correctly for legal content

## Phase 7: Export + Polish (Days 24-28)

**What:**

- Export modal (section selection)
- PDF generation: header, sections, footnotes, confidence labels, watermark, serif font
- Export warning for unreviewed sections
- Seed data: 1-2 matters with complete intake + analysis
- Polish: loading states, error states, empty states, spacing, page titles
- Docker Compose full build verification

**Deliverables:**

- [ ] PDF exports with professional legal formatting
- [ ] Watermark and disclaimer present
- [ ] Unreviewed section warning works
- [ ] Seed data provides immediate demo experience
- [ ] All loading/error/empty states implemented
- [ ] `docker compose up` works on clean machine
