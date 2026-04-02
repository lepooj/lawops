# LawCopilot

**Legal analysis workbench — controlled pilot.**

A single-purpose tool where a Canadian litigation lawyer can create a matter, enter structured legal context, run AI analysis, review sectioned output with extracted authorities, and export a professional PDF memo draft.

## Status

**Pre-development.** Repository foundation complete. Phase 1 implementation next.

## Quick Start

```bash
# Prerequisites: Node.js 22, Docker (for PostgreSQL)

npm install
cp .env.example .env.local
# Edit .env.local: set AUTH_SECRET and OPENAI_API_KEY

# Start database
docker compose up -d db

# Setup database
npx prisma migrate dev
npm run db:seed

# Run
npm run dev
# Open http://localhost:3000
```

## Docker (Production)

```bash
cp .env.example .env
# Edit .env: set AUTH_SECRET and OPENAI_API_KEY

docker compose up -d
# Open http://localhost:3000
```

## Architecture

- **Next.js 15** (App Router) + React 19 + TypeScript
- **PostgreSQL 17** via Prisma ORM
- **NextAuth v5** — credentials provider, JWT sessions
- **Tailwind CSS v4** + Radix UI
- **OpenAI API** — single-call analysis generation
- **Docker Compose** — local or private VPS deployment

## Documentation

| Doc                                                  | Purpose                            |
| ---------------------------------------------------- | ---------------------------------- |
| [PILOT-PLAN.md](PILOT-PLAN.md)                       | Complete product specification     |
| [CLAUDE.md](CLAUDE.md)                               | Repo rules for Claude Code         |
| [docs/PILOT-SCOPE.md](docs/PILOT-SCOPE.md)           | What's in and out of pilot         |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)         | Technical architecture             |
| [docs/DATA-MODEL.md](docs/DATA-MODEL.md)             | Database schema design             |
| [docs/AI-ORCHESTRATION.md](docs/AI-ORCHESTRATION.md) | Prompt strategy and output parsing |
| [docs/SECURITY.md](docs/SECURITY.md)                 | Security controls                  |
| [docs/BUILD-ORDER.md](docs/BUILD-ORDER.md)           | Implementation phases              |

## License

Private. Not open source.
