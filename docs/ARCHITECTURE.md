# Architecture

## Stack

| Layer           | Choice                                          | Why                                    |
| --------------- | ----------------------------------------------- | -------------------------------------- |
| Framework       | Next.js 15 (App Router) + React 19 + TypeScript | Server actions = no separate API layer |
| Styling         | Tailwind CSS v4 + Radix UI primitives           | Fast, accessible, dark-theme ready     |
| Rich text       | Tiptap (ProseMirror)                            | Fact narrative field only              |
| Forms           | React Hook Form + Zod                           | Multi-section intake with validation   |
| Database        | PostgreSQL 17 via Prisma ORM                    | Relational + JSONB for flexible fields |
| Auth            | NextAuth v5 (credentials provider)              | JWT sessions, bcrypt, minimal setup    |
| File storage    | Local filesystem (`./data/uploads/`)            | No S3 for pilot                        |
| Text extraction | pdf-parse (PDF) + mammoth (DOCX)                | Lightweight, in-process                |
| AI              | OpenAI API                                      | Single-call, server-side only          |
| PDF export      | @react-pdf/renderer                             | React-native PDF, no headless browser  |
| Deployment      | Docker Compose                                  | One command: `docker compose up`       |

## System Diagram

```
┌──────────────────────────────────────────────────┐
│  Browser (localhost:3000 or pilot.domain)          │
│  React client components                           │
└──────────────────┬─────────────────────────────────┘
                   │ Server Actions
┌──────────────────▼─────────────────────────────────┐
│  Next.js Server                                     │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐│
│  │ Server      │  │ Prompt       │  │ File       ││
│  │ Actions     │  │ Builder +    │  │ Upload +   ││
│  │ (CRUD)      │  │ Output       │  │ Text       ││
│  │             │  │ Parser       │  │ Extract    ││
│  └──────┬──────┘  └──────┬───────┘  └─────┬──────┘│
│         │                │               │        │
│  ┌──────▼──────┐  ┌──────▼───────┐  ┌────▼──────┐│
│  │ Prisma ORM  │  │ OpenAI API   │  │ Local FS  ││
│  └──────┬──────┘  └──────────────┘  └───────────┘│
└─────────┼────────────────────────────────────────┘
          │
┌─────────▼────────┐
│ PostgreSQL 17     │
│ (Docker)          │
└──────────────────┘
```

## Directory Structure

```
src/
  app/                              Next.js App Router
    (auth)/
      login/page.tsx                Login page
    dashboard/
      page.tsx                      Matter list
    matters/[id]/
      layout.tsx                    Matter workspace layout (tabs)
      page.tsx                      Redirect to intake
      intake/page.tsx               Structured intake form
      analysis/page.tsx             Analysis viewer
      documents/page.tsx            Document list + upload
    api/
      upload/route.ts               File upload endpoint
      files/[id]/route.ts           File download endpoint (auth-gated)
    auth.ts                         NextAuth config
    layout.tsx                      Root layout (dark theme, fonts)
    globals.css                     Tailwind directives + custom CSS
  components/
    matter/                         Matter-specific (workspace, cards)
    analysis/                       Analysis viewer, section cards, TOC
    intake/                         Intake form sections, progress rail
    ui/                             Radix UI wrappers (button, dialog, etc.)
    layout/                         App shell, sidebar
  server/
    actions/
      auth.ts                       Login, session management
      matters.ts                    Matter CRUD
      intake.ts                     Intake save/load
      analysis.ts                   Run analysis, update review status
      documents.ts                  Upload, delete, extraction
      citations.ts                  Citation verification status updates
    lib/
      prompt-builder.ts             Intake → structured user message
      output-parser.ts              Raw response → sections
      citation-extractor.ts         Extract + classify citations
      text-extractor.ts             PDF/DOCX/TXT → plain text
  lib/
    db.ts                           Prisma singleton
    utils.ts                        cn() + shared helpers
    constants.ts                    Enums, validation, legal reference data
    logger.ts                       Structured logger
  types/
    index.ts                        Shared TypeScript types
  middleware.ts                     CSP headers + nonces
prisma/
  schema.prisma                     7 entities
  seed.ts                           Demo data
  migrations/                       Migration files
```

## Route Map

| Route                     | Purpose             | Auth |
| ------------------------- | ------------------- | ---- |
| `/login`                  | Login page          | No   |
| `/dashboard`              | Matter list         | Yes  |
| `/matters/[id]`           | Workspace redirect  | Yes  |
| `/matters/[id]/intake`    | Intake form         | Yes  |
| `/matters/[id]/analysis`  | Analysis viewer     | Yes  |
| `/matters/[id]/documents` | Document management | Yes  |
| `POST /api/upload`        | File upload         | Yes  |
| `GET /api/files/[id]`     | File download       | Yes  |

## No Background Jobs

For pilot scale:

- Text extraction (pdf-parse, mammoth): < 5 seconds inline
- AI analysis: 30-90 seconds with progress UI
- PDF export: < 5 seconds inline

No job queue needed. Add only if latency becomes blocking.

## Data Flow

### Analysis Generation

1. User clicks "Run Analysis"
2. Server action validates intake completeness
3. `prompt-builder.ts` constructs user message from intake + document excerpts
4. Single OpenAI API call (system prompt + user message)
5. `output-parser.ts` splits response into 10 sections
6. `citation-extractor.ts` extracts citations, assigns provenance
7. AnalysisRun + AnalysisSections + Citations saved in transaction
8. Client redirects to analysis tab

### Document Upload

1. File hits `/api/upload` with auth check
2. Validate: extension allowlist, MIME check, size limit
3. Save to `./data/uploads/` with UUID filename
4. `text-extractor.ts` extracts text inline
5. Document record created with extraction status
