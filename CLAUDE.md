# CLAUDE.md — LawCopilot

## What This Is

LawCopilot is a **controlled-pilot legal analysis workbench** for Canadian litigation lawyers. It is NOT a chatbot, NOT a document Q&A tool, NOT a multi-tenant SaaS platform.

**One workflow:** Intake → Analysis → Review → Export.

A lawyer creates a matter, enters structured legal context, optionally attaches documents, runs AI analysis, reviews sectioned output with extracted authorities, and exports a professional PDF memo draft.

**Deployment:** Local Docker or private VPS. Not public internet. Single-user per instance for pilot.

## Pilot Scope — What Is In

- Email/password auth (pre-created accounts, no registration flow)
- Matter CRUD (create, list, open, archive)
- 6-section structured intake form (3 required: Jurisdiction, Facts, Objective)
- Document upload with text extraction (PDF, DOCX, TXT)
- AI analysis generation (single OpenAI call, structured prompt)
- 10-section analysis viewer with sticky TOC
- Authority extraction with provenance labels (USER_PROVIDED, UNVERIFIED, VERIFIED, FLAGGED)
- Per-section review status (Unreviewed, Reviewed, Flagged)
- PDF export with legal formatting and disclaimers
- Persistent "verify before reliance" messaging

## Pilot Scope — What Is Explicitly Out

Do NOT implement any of these unless explicitly instructed:

- Multi-user / teams / sharing / organization model
- RBAC / roles (single user = no roles)
- 2FA / TOTP / OAuth / SSO
- OCR for scanned documents
- CanLII auto-verification or citation link-out
- Follow-up chat / Q&A threads / conversation interface
- DOCX export
- Background job queue
- Admin panel / settings UI
- Mobile responsive design
- Billing / subscriptions
- Section-level regeneration / refinement
- Analysis run history / version comparison
- Document preview in-app
- Registration flow (accounts pre-created for pilot)

## Architecture

```
Next.js 15 (App Router) + React 19 + TypeScript
├─ Styling: Tailwind CSS v4 + Radix UI primitives
├─ Rich text: Tiptap (fact narrative field only)
├─ Forms: React Hook Form + Zod
├─ Database: PostgreSQL 17 + Prisma ORM
├─ Auth: NextAuth v5 (credentials provider, JWT sessions)
├─ File storage: Local filesystem (./data/uploads/)
├─ Text extraction: pdf-parse (PDF) + mammoth (DOCX)
├─ AI: OpenAI API (single-call, server-side only)
├─ PDF export: @react-pdf/renderer
└─ Deployment: Docker Compose
```

### Key Directories

```
src/
  app/                          Next.js pages and API routes
    (auth)/login/               Login page
    dashboard/                  Matter list
    matters/[id]/               Matter workspace (intake, analysis, documents tabs)
    api/                        File upload/download routes only
  components/
    matter/                     Matter-specific components
    analysis/                   Analysis viewer components
    intake/                     Intake form components
    ui/                         Shared UI primitives (Radix wrappers)
    layout/                     Shell, sidebar, providers
  server/
    actions/                    Server actions (all DB mutations)
    lib/                        Pure business logic (prompt builder, output parser, citation extractor)
  lib/
    db.ts                       Prisma client singleton
    utils.ts                    cn() helper, shared utilities
    constants.ts                Enums, validation constants, legal reference data
    logger.ts                   Structured logger (scrubs sensitive data)
  types/                        TypeScript type definitions
prisma/
  schema.prisma                 Data model (7 entities for pilot)
  seed.ts                       Demo data for development
  migrations/                   Prisma migrations
docs/                           Architecture and design docs
data/
  uploads/                      Local file storage (gitignored)
```

### Runtime Boundaries

- **Server actions** handle all DB mutations. Every action calls `requireSession()` and scopes queries by `userId`.
- **API routes** exist only for file upload/download. These also enforce auth.
- **Components** are client-side React. Data flows through server actions.
- **AI calls** happen only in server actions. The OpenAI API key never reaches the client.

## Route Map

```
/login                          → Login page
/dashboard                      → Matter list
/matters/[id]                   → Matter workspace (redirects to intake)
/matters/[id]/intake            → Structured intake form
/matters/[id]/analysis          → Analysis viewer
/matters/[id]/documents         → Document list + upload
```

4 screens + 1 export modal. That's it.

## Security Rules

These are non-negotiable. Every change must preserve these.

### Server-Side Only AI Calls

- All OpenAI API calls happen in server actions. API key in `.env` only.
- The key must NEVER appear in client bundles. Verify: zero requests to `api.openai.com` in browser DevTools.

### User Isolation

- Every DB query that touches user data MUST include `userId` from session in the where clause.
- No exceptions for authenticated endpoints.

### Input Validation

- Zod schemas on every server action input. No exceptions.

### File Upload Safety

- Extension allowlist: PDF, DOCX, TXT only.
- Server-side MIME validation.
- 25MB max per file, 5 files max per matter.
- UUID filenames on disk. Never use original filenames for storage paths.

### No Sensitive Data in Logs

Never log: matter content, facts, analysis output, document text, full prompts, full model responses, passwords, tokens.
Do log: action types, userId, matterId, timestamps, model used, token counts, latency, errors (scrubbed of user content).

### Prompt Injection Controls

- User content wrapped in XML-delimited sections within the user message.
- User content NEVER placed in the system prompt.
- If system prompt echo detected in output, strip it server-side.

### Session Security

- bcrypt 12 rounds for passwords.
- JWT sessions, 8-hour max age.
- httpOnly + Secure + SameSite=Strict cookies.

### CSP Headers

- Strict Content-Security-Policy with nonces on every response.

### Least-Data-to-Model Principle

- Send only data needed for analysis. No emails, session info, or system metadata.
- Truncate document text (3000 chars per doc).
- Omit empty optional fields entirely.

## AI Orchestration Rules

### Single-Call Architecture

One system prompt + one user message + one response. No multi-turn. No agent chains. No tool use. No RAG.

### System Prompt

The Canadian Legal Strategist CoPilot prompt is used verbatim as the system message. Not edited. Not shown to users.

### User Message Construction

Server builds the user message by templating intake data into labeled XML-delimited sections:

- `<matter_context>` — jurisdiction, facts, parties, objective, procedural history, authorities
- `<uploaded_documents>` — document excerpts (3000 chars each, max 5 docs)
- Closing instruction specifying the exact 10 output sections

### Output Parsing

1. Section splitting: regex on numbered headers
2. Citation extraction: regex for Canadian citation patterns (neutral, traditional, statutes)
3. Provenance labeling: match against user-provided authorities → USER_PROVIDED, else → UNVERIFIED
4. Fallback: if parsing fails, display raw output as single "Full Analysis" section

### The 10 Output Sections

1. Executive Assessment
2. Issues to Decide
3. Governing Law
4. Application to the Facts
5. Strongest Arguments in Favour
6. Best Counterarguments and Rebuttals
7. Procedural Strategy
8. Authority Map
9. Risk Analysis
10. Draft Advocacy Points / Work-Product Support

### Authority Provenance Model

| Label         | Meaning                                                |
| ------------- | ------------------------------------------------------ |
| USER_PROVIDED | Lawyer entered this in intake                          |
| UNVERIFIED    | AI-generated, not independently confirmed (default)    |
| VERIFIED      | Lawyer confirmed this authority exists and is relevant |
| FLAGGED       | Lawyer suspects fabrication or misapplication          |

### Review State Model

Each analysis section: `UNREVIEWED` / `REVIEWED` / `FLAGGED`

## Document Handling Rules

- Accept: PDF (.pdf), DOCX (.docx), TXT (.txt) only
- Text extraction: pdf-parse for PDF, mammoth for DOCX, direct read for TXT
- Extraction runs inline on upload (< 5 sec for reasonable documents)
- Extracted text is stored in DB, truncated to 3000 chars when sent to model
- OCR is explicitly out of scope — require text-based PDFs
- Extraction failure is non-fatal: show status, allow analysis without that document
- Files stored on local filesystem with UUID names under `./data/uploads/`
- No public file URLs. Files served through authenticated API routes only.

## UX Quality Bar

### Theme

- Dark theme throughout. No light mode.
- Serif font (Source Serif 4) for legal analysis content.
- Sans-serif (Inter) for UI chrome.

### Visual Standards

- Every screen needs a clear focal zone. Not everything has equal weight.
- Use 3-tier surface hierarchy: Page (darkest) → Surface → Elevated.
- Interactive elements must have visible hover states.
- Loading states on every async operation.
- Error states that explain what happened and what to do.
- Empty states that guide the user forward.

### Trust Messaging

- State facts, don't apologize. "3 authorities require verification" not "Warning: This may contain errors."
- No percentage confidence scores. No star ratings. No colored meters.
- Three provenance states (UNVERIFIED/VERIFIED/FLAGGED) — simple, honest, actionable.
- Footer on every analysis: "AI-generated analysis. Verify all authorities before reliance."

### No Fake Confidence Theater

The product feels like a sharp junior who does good work but flags what they're unsure about. Not like a tool that's constantly disclaiming its own usefulness.

## Development

### Setup

```bash
# Install dependencies
npm install

# Copy env template
cp .env.example .env.local

# Start PostgreSQL (Docker)
docker compose up -d db

# Run migrations
npx prisma migrate dev

# Seed demo data
npm run db:seed

# Start dev server
npm run dev
```

### Commands

```bash
npm run dev               # Dev server (localhost:3000)
npm run build             # Production build
npm run type-check        # TypeScript check (tsc --noEmit)
npm run lint              # ESLint
npm run lint:fix          # ESLint with auto-fix
npm run format            # Prettier format all
npm run format:check      # Prettier check
npm run test              # Vitest
npm run test:watch        # Vitest watch mode
npm run db:generate       # Regenerate Prisma client
npm run db:migrate        # Create + apply migration
npm run db:studio         # Prisma Studio
npm run db:seed           # Seed demo data
```

### Verification Checklist

Every change to server logic, database, or Docker must pass before being considered done:

1. `npm run type-check` — must pass
2. `npm run test` — must pass
3. `npm run lint` — must pass
4. Manual smoke test if the change affects UI

Do not say "done" until verification passes.

## Conventions

### Server Actions

- All server actions go in `src/server/actions/`. Grouped by domain.
- Every action must call `requireSession()` as its first line.
- Every DB query must include `userId` in the where clause.
- Return `{ error: string }` for user-facing failures, not thrown exceptions.
- Use Zod for input validation.

### Components

- Matter components: `src/components/matter/`
- Analysis components: `src/components/analysis/`
- Intake components: `src/components/intake/`
- Shared UI primitives: `src/components/ui/`
- Layout: `src/components/layout/`
- All components are client-side ("use client"). Data flows through server actions.

### Business Logic

- Pure computation (prompt builder, output parser, citation extractor) goes in `src/server/lib/`. No DB access. Fully unit-testable.
- DB-touching logic belongs in server actions, not lib files.
- `src/lib/constants.ts` is the single source of truth for all enums, validation constants, and legal reference data.

### Styling

- Tailwind CSS v4 (CSS-first config via PostCSS).
- Use `cn()` from `src/lib/utils.ts` for conditional class merging.
- Dark theme throughout. Do NOT introduce light-mode styles.

### Database

- Prisma ORM exclusively. Never raw SQL.
- All queries scoped by `userId` from session.
- Multi-step writes MUST use `db.$transaction()`.
- Always use Prisma migrations for schema changes.

### Testing

- Vitest with globals enabled.
- Test files in `__tests__/` directories next to source.
- Focus on pure logic: prompt builder, output parser, citation extractor, utilities.
- Run `npm run test` before committing server logic changes.

## Guardrails

### Do

- Read existing code before modifying.
- Keep diffs minimal.
- Run type-check and tests after changes.
- Use the structured logger for server-side logging, not console.\*.
- Wrap multi-step DB writes in transactions.

### Do Not

- Do NOT add raw SQL. Prisma only.
- Do NOT add API routes for things that should be server actions.
- Do NOT add features beyond what was asked.
- Do NOT add OAuth, SSO, 2FA, or external auth providers.
- Do NOT add abstractions for hypothetical future requirements.
- Do NOT introduce dependencies without clear justification.
- Do NOT create new files when editing an existing one would work.
- Do NOT add cloud deployment config unless explicitly asked.
- Do NOT skip verification steps.
- Do NOT drift into chatbot, AI wrapper, or enterprise sprawl.
- Do NOT introduce data leakage risks.
- Do NOT overbuild. This is a controlled pilot, not a platform.
- Do NOT add multi-user, org model, or RBAC features.

### Security-Sensitive Files (Edit Carefully)

- `src/server/actions/auth.ts` — authentication logic
- `src/app/auth.ts` — NextAuth configuration
- `src/middleware.ts` — CSP headers
- `src/app/api/` — file upload/download routes
- `prisma/schema.prisma` — data model
- `docker-compose.yml` — container config
- `Dockerfile` — build security

## Key Files

| Purpose            | File                                   |
| ------------------ | -------------------------------------- |
| Prisma schema      | `prisma/schema.prisma`                 |
| Auth config        | `src/app/auth.ts`                      |
| Server actions     | `src/server/actions/`                  |
| Prompt builder     | `src/server/lib/prompt-builder.ts`     |
| Output parser      | `src/server/lib/output-parser.ts`      |
| Citation extractor | `src/server/lib/citation-extractor.ts` |
| Constants & enums  | `src/lib/constants.ts`                 |
| Prisma client      | `src/lib/db.ts`                        |
| Logger             | `src/lib/logger.ts`                    |
| Utilities          | `src/lib/utils.ts`                     |
| Docker config      | `Dockerfile`, `docker-compose.yml`     |
| Env template       | `.env.example`                         |
| Pilot spec         | `PILOT-PLAN.md`                        |

## Environment Variables

| Variable              | Required | Purpose                                  |
| --------------------- | -------- | ---------------------------------------- |
| `DATABASE_URL`        | Yes      | PostgreSQL connection string             |
| `AUTH_SECRET`         | Yes      | NextAuth JWT signing secret              |
| `OPENAI_API_KEY`      | Yes      | OpenAI API key for analysis generation   |
| `OPENAI_MODEL`        | No       | Model override (default in code)         |
| `NEXT_PUBLIC_APP_URL` | No       | App URL (default: http://localhost:3000) |
