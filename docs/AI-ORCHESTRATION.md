# AI Orchestration

## Architecture

**Single-call. No multi-turn. No agents. No RAG.**

```
[System prompt: Legal CoPilot — verbatim, not edited]
+
[User message: structured context from intake + document excerpts]
=
[One response → parsed into 10 sections + citations]
```

## System Prompt

The Canadian Legal Strategist CoPilot prompt is the system message. Used verbatim. Not shown to users. Not editable by users. Stored in code with a version identifier.

## User Message Construction

Server builds the user message from intake data. Template:

```
<matter_context>

JURISDICTION AND FORUM
Province/Territory: {jurisdiction.province}
Court Level: {jurisdiction.courtLevel}
Jurisdiction Type: {jurisdiction.jurisdictionType}
Area of Law: {areaOfLaw}

RELEVANT FACTS
{facts}

PARTIES
{parties formatted as list}

DESIRED LEGAL OUTCOME
{desiredOutcome}

CONSTRAINTS
{constraints}

PROCEDURAL HISTORY
Current Stage: {proceduralStage}
Prior Decisions: {priorDecisions}
Key Dates: {keyDates formatted}

KNOWN SUPPORTING AUTHORITIES
{supportingAuthorities formatted}

KNOWN OPPOSING ARGUMENTS
{opposingArguments}

</matter_context>

<uploaded_documents>

[Document: {originalFilename}]
Type: {documentType}
Content (excerpt):
{first 3000 characters of extractedText}

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

### Construction Rules

- User input wrapped in `<matter_context>` and `<uploaded_documents>` XML delimiters
- Empty optional fields are **omitted**, not sent as blank
- Document text truncated to 3000 chars per document
- Maximum 5 documents included
- User content NEVER placed in the system prompt

## Output Parsing

### Section Splitting

Regex on numbered headers: `## 1.`, `**1.`, `1.` patterns. The closing instruction makes these predictable.

Each section gets:

- `sectionKey`: snake_case identifier (e.g., `executive_assessment`)
- `title`: display heading
- `summary`: first 2-3 sentences
- `content`: full section text

### Citation Extraction

Regex patterns for Canadian citations:

| Type        | Pattern                          | Example                        |
| ----------- | -------------------------------- | ------------------------------ |
| Neutral     | `YYYY COURT ###`                 | `2024 SCC 15`, `2023 ONCA 456` |
| Traditional | `[YYYY] # Reporter (series) ###` | `[2008] 1 SCR 190`             |
| Statute     | `RSC/RSO/etc YYYY, c X`          | `RSC 1985, c C-46`             |

### Provenance Assignment

1. If citation matches one the user provided in intake → `USER_PROVIDED`
2. All other citations → `UNVERIFIED` (honest default)
3. User can manually mark → `VERIFIED` or `FLAGGED`

### Fallback

If section parsing fails entirely, display the raw output as a single "Full Analysis" section. Never show a blank screen.

## Traceability

Every AnalysisRun stores:

- `inputSnapshot`: exact intake data at time of run (snapshot, not reference)
- `documentExcerpts`: document IDs + truncated text included
- `promptVersion`: version identifier from code
- `model`: model string used
- `inputTokens` / `outputTokens`: token usage
- `rawOutput`: unmodified model response
- `latencyMs`: wall-clock time

Any analysis can be fully reconstructed: "This is exactly what was sent and what came back."

## What NOT to Send to Model

- User passwords or session tokens
- Internal system config or file paths
- Other users' data
- System metadata (app version, server info)

If system prompt echo detected in output → strip server-side before storing.

## Handling Uncertainty

- Every AI-generated citation defaults to `UNVERIFIED`
- Footer: "AI-generated analysis. Verify all authorities before reliance."
- No percentage confidence scores. No star ratings. No colored meters.
- Three states: UNVERIFIED / VERIFIED / FLAGGED. Simple, honest, actionable.

## No Chat

There is no chat interface. No message history. No conversation thread.

Interaction model: **fill form → press button → read structured output → review → export.**

If section refinement is added later (nice-to-have), it's a single text input that regenerates one section. Not a conversation.
