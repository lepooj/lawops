# Decisions Log

Locked decisions for the controlled pilot. Changes require explicit discussion.

## Architecture Decisions

### D1: Single-call AI, no chat

**Decision:** One system prompt + one user message + one response. No multi-turn, no agents, no RAG.
**Why:** The thesis is that structured intake → structured output is more useful than conversation. Proving this is the pilot's purpose.

### D2: Server actions for all mutations

**Decision:** No separate API layer. Server actions handle all DB mutations and AI calls.
**Why:** Next.js App Router server actions eliminate the need for a REST/GraphQL API. Faster to build. One fewer layer to secure.

### D3: Local filesystem for uploads

**Decision:** Files stored on local disk (`./data/uploads/`), not S3 or cloud storage.
**Why:** Pilot is local Docker or single VPS. No cloud dependency. Storage module can be swapped later.

### D4: Inline text extraction

**Decision:** pdf-parse and mammoth run synchronously on upload. No background jobs.
**Why:** Extraction takes < 5 seconds for typical legal documents. Background jobs add complexity with no pilot-scale benefit.

### D5: No OCR

**Decision:** Require text-based PDFs. Scanned documents show "Extraction failed."
**Why:** OCR is a scope trap (Tesseract setup, accuracy tuning, error handling). Pilot users can provide text-based PDFs.

### D6: Single-user per instance

**Decision:** No multi-user, no orgs, no roles, no sharing.
**Why:** Pilot proves the workflow, not the collaboration model. userId scoping is sufficient isolation.

### D7: Pre-created accounts

**Decision:** No registration flow. Accounts seeded or created via CLI/seed script.
**Why:** < 10 known pilot users. Registration flow is engineering time spent on non-pilot concerns.

### D8: PDF export only

**Decision:** No DOCX export.
**Why:** DOCX formatting is a rabbit hole. PDF with @react-pdf/renderer is fast and looks professional.

### D9: 4-state provenance model

**Decision:** USER_PROVIDED / UNVERIFIED / VERIFIED / FLAGGED. No percentage confidence.
**Why:** Lawyers see through fake confidence scores. Simple states are honest and actionable.

### D10: Dark theme, serif legal content

**Decision:** Dark UI theme throughout. Source Serif 4 for analysis content. Inter for UI chrome.
**Why:** Dark theme signals "professional tool." Serif font for legal content matches expectations for legal memoranda.

## Technical Choices

### T1: Next.js 15 + React 19

**Why:** App Router, server actions, server components — fastest path to a working app with no separate backend.

### T2: Prisma ORM

**Why:** Type-safe queries, migration system, no raw SQL. Matches the "no raw SQL" security constraint.

### T3: NextAuth v5 (credentials)

**Why:** JWT sessions, bcrypt, minimal configuration. No OAuth providers needed for pilot.

### T4: Tailwind v4 + Radix UI

**Why:** Rapid styling, dark theme support, accessible primitives. Proven stack.

### T5: Tiptap for rich text

**Why:** Best React rich text editor. Needed only for the fact narrative field in intake.

### T6: Vitest for testing

**Why:** Fast, compatible with Vite/Next.js, globals mode, good DX.
