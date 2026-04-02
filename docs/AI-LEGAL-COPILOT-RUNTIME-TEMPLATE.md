# AI Legal CoPilot — Runtime Template

**Status:** Canonical  
**Source of truth for:** `src/lib/ai/runtime-template.ts`

---

## Purpose

The runtime template defines the JSON structure sent as the **user message** alongside the system prompt. It provides the model with:

- Selected mode (memo, strategy, case_comparison, draft_factum)
- Jurisdiction and forum context
- Matter details and task description
- Structured facts (undisputed, disputed, assumed, missing)
- Authorities (user-provided, retrieved, statutes/rules)
- Behavioral constraints
- Style and output preferences

## Template Shape

```json
{
  "mode": "memo",
  "user_name": "Dan",
  "matter_id": "optional-internal-id",
  "request_id": "optional-request-id",
  "jurisdiction": {
    "country": "Canada",
    "province_or_territory": "Ontario",
    "forum": "Ontario Superior Court of Justice",
    "legal_system": "common_law"
  },
  "matter": {
    "title": "Judicial review of municipal licensing decision",
    "area_of_law": ["administrative", "constitutional"],
    "procedural_posture": "pre-application analysis",
    "desired_outcome": "Assess viability of judicial review and interim relief",
    "task": "Prepare a legal memo with strongest arguments, weaknesses, and research gaps"
  },
  "facts": {
    "undisputed_facts": [],
    "disputed_facts": [],
    "assumed_facts": [],
    "missing_facts": []
  },
  "authorities": {
    "provided_authorities": [],
    "retrieved_authorities": [],
    "statutes_and_rules": []
  },
  "constraints": {
    "use_only_provided_and_retrieved_sources": true,
    "allow_general_legal_reasoning_without_citation": true,
    "allow_rough_strength_assessment": true,
    "allow_numeric_probability": false,
    "jurisdiction_strict": true,
    "quote_only_when_text_available": true,
    "do_not_invent_citations": true
  },
  "style": {
    "tone": "professional",
    "verbosity": "medium",
    "audience": "lawyer",
    "include_counterarguments": true,
    "include_research_gaps": true,
    "include_procedural_risks": true
  },
  "output_preferences": {
    "return_json_only": true,
    "max_authorities": 12,
    "prefer_bulleted_reasoning": true
  }
}
```

## Field Notes

- `mode` selects the analysis mode. See AI-LEGAL-COPILOT-MODES.md.
- `user_name` is optional and used only for audit/traceability, not injected into the analysis.
- `matter_id` and `request_id` are internal tracking IDs, not sent to the model in production.
- `jurisdiction.legal_system` should be `common_law` or `civil_law` (for Québec).
- `authorities.provided_authorities[].source_type` can be `uploaded_document`, `user_input_only`, or `retrieved`.
- `constraints` control the model's behavior boundaries for this specific run.
- `output_preferences.return_json_only` must always be `true` in production to enforce structured output.

## Document Excerpts

When documents are included, they are added to the runtime payload under a `documents` key:

```json
{
  "documents": [
    {
      "id": "doc-uuid",
      "filename": "statement_of_claim.pdf",
      "document_type": "PLEADING",
      "extraction_method": "PDF_PARSE",
      "excerpt": "First 3000 characters of extracted text..."
    }
  ]
}
```

For OCR-derived text, the `extraction_method` will be `OCR` and the excerpt is prefixed with:
`[Note: This text was extracted via OCR and may contain errors.]`
