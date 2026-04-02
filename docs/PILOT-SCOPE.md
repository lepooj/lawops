# Pilot Scope

## Product Shape

Single-purpose legal analysis workbench. One workflow: **Intake → Analysis → Review → Export.**

**First user:** Canadian litigation lawyer or senior paralegal with an active matter.
**First job:** "I need a first-pass analysis of this case — issues, applicable law, arguments on both sides, risk assessment, and a procedural roadmap."

## What's In

| Feature                                          | Why Non-Negotiable                                  |
| ------------------------------------------------ | --------------------------------------------------- |
| Auth (email/password)                            | Real data needs real access control                 |
| Matter CRUD (create, list, open, archive)        | It's a workspace, not a one-shot tool               |
| 6-section structured intake form                 | Core differentiator — what makes this not-a-chatbot |
| Document upload + text extraction (PDF/DOCX/TXT) | Lawyers bring documents                             |
| AI analysis generation (single OpenAI call)      | The product's reason to exist                       |
| 10-section structured analysis viewer            | Output must be navigable, not a text wall           |
| Authority extraction + provenance labels         | Trust layer                                         |
| Per-section review status                        | Lawyer marks sections reviewed/flagged              |
| PDF export with legal formatting                 | Tangible takeaway                                   |
| "Verify before reliance" messaging               | Legal responsibility                                |

## What's Out

| Feature                        | Why Deferred                                   |
| ------------------------------ | ---------------------------------------------- |
| Multi-user / teams / sharing   | Single-user pilot                              |
| Organization / tenant model    | One user = no orgs                             |
| RBAC / roles                   | One user = one role                            |
| 2FA / TOTP / OAuth             | Controlled pilot with known users              |
| OCR for scanned documents      | Scope trap. Require text-based PDFs.           |
| CanLII auto-verification       | Manual review labels are honest and sufficient |
| Follow-up chat / Q&A threads   | Prove structured loop first                    |
| DOCX export                    | PDF only. DOCX formatting is a rabbit hole.    |
| Background job queue           | Everything runs inline                         |
| Admin panel / settings UI      | Hardcode sensible defaults                     |
| Citation link-out to databases | User can search CanLII themselves              |
| Billing / subscriptions        | Not relevant for pilot                         |
| Mobile responsive              | Desktop-only. Lawyers use this at a desk.      |
| Registration flow              | Accounts pre-created for pilot users           |
| Section-level refinement       | Strongest nice-to-have, but deferred           |
| Analysis run history           | Deferred                                       |
| Document preview in-app        | Show filename + extraction status only         |

## Nice-to-Have (Only If Time Allows)

1. Section-level refinement ("strengthen this argument")
2. Analysis run history (re-run with updated intake)
3. Risk matrix visualization

## What This Is NOT

| Not This                     | Why Not                                   |
| ---------------------------- | ----------------------------------------- |
| Document Q&A tool            | Commodity, not differentiated             |
| Legal research assistant     | Requires verified databases we don't have |
| Contract review/drafting     | Different workflow entirely               |
| Multi-practice platform      | Litigation first                          |
| Chatbot with legal knowledge | Structured > conversational is the thesis |
| Team collaboration tool      | Single-user pilot                         |

## The Workflow

```
Login → Dashboard (matter list) → Create Matter → Structured Intake (6 sections)
→ Attach Documents → Run Analysis → Review Sectioned Output → Mark Review Status
→ Inspect Authorities → Export PDF
```

## Locked Decisions

| #   | Decision                         | Answer                                                 |
| --- | -------------------------------- | ------------------------------------------------------ |
| 1   | AI model                         | OpenAI (model specified in env)                        |
| 2   | Output sections                  | 10 fixed sections                                      |
| 3   | Intake sections                  | 6 sections, 3 required                                 |
| 4   | Citation confidence              | 4 states: USER_PROVIDED, UNVERIFIED, VERIFIED, FLAGGED |
| 5   | Review model                     | 3 states: Unreviewed, Reviewed, Flagged                |
| 6   | No chat interface                | Structured intake → structured output                  |
| 7   | Dark theme + serif legal content | Source Serif 4 for analysis, Inter for UI              |
| 8   | Export format                    | PDF only                                               |
| 9   | User model                       | Single-user per instance                               |
| 10  | Deployment                       | Docker Compose (local or single VPS)                   |
