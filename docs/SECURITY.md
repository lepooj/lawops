# Security

## Deployment Model

**Controlled pilot:** Private hosted instance or local Docker. Not public internet. < 10 known users.

- **Option A:** Docker Compose on VPS behind VPN or IP allowlist
- **Option B:** Each user runs Docker locally (zero network exposure)

## Mandatory Controls

| Control                   | Implementation                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| Server-side LLM calls     | API key in `.env`, all calls from server actions, key never in client bundle              |
| Authentication            | Email/password, bcrypt 12 rounds, JWT sessions (8-hour), httpOnly+Secure+SameSite cookies |
| User isolation            | Every DB query scoped by `userId` from session                                            |
| Input validation          | Zod schemas on every server action                                                        |
| File upload safety        | Extension allowlist (PDF/DOCX/TXT), MIME validation, 25MB limit, UUID filenames           |
| CSP headers               | Strict Content-Security-Policy with nonces                                                |
| No sensitive data in logs | Log action types + metadata only                                                          |
| Prompt injection controls | XML-delimited user input in user message, never in system prompt                          |
| SQL injection prevention  | Prisma ORM only, no raw SQL                                                               |

## What Must NOT Be Logged

- Matter content (facts, arguments, outcomes)
- Analysis output (raw or parsed)
- Document text
- Full prompts or model responses
- Passwords or tokens

## What SHOULD Be Logged

- Action types: `matter.created`, `analysis.run`, `document.uploaded`, `export.generated`
- Metadata: userId, matterId, timestamp, model, token count, latency
- Errors: stack traces scrubbed of user content
- Auth events: login success/failure (no passwords)

## What Must NOT Be Sent to Model

- Passwords or session tokens
- System configuration or file paths
- Other users' data
- App metadata

## Least-Data-to-Model

- Only data needed for analysis
- Truncate documents (3000 chars each)
- Omit empty optional fields
- No email, session, or system metadata in prompts

## File Upload Rules

- Extension allowlist: `.pdf`, `.docx`, `.txt`
- Server-side MIME type validation
- Max 25MB per file
- Max 5 files per matter
- UUID filenames — never use original filename for storage
- Files served through authenticated API routes only
- No public file URLs

## Provider Data Controls

- OpenAI API: inputs/outputs not used for training by default (verify current policy)
- Provide pilot participants with a one-page data handling summary before use
- If a participant requires zero external API calls, the pilot cannot serve them

## Deferred (Not Needed for Pilot)

| Control                  | Why Deferred                               |
| ------------------------ | ------------------------------------------ |
| 2FA / TOTP               | < 10 known users, controlled access        |
| RBAC / roles             | Single-user, no roles needed               |
| Encryption at rest (DB)  | OS-level disk encryption sufficient        |
| Malware scanning uploads | Trusted pilot users                        |
| Rate limiting            | < 10 users                                 |
| Audit log viewer UI      | Stdout logging sufficient                  |
| Idle session timeout     | Controlled pilot                           |
| HTTPS                    | Required only if deployed beyond localhost |
