# AI Legal CoPilot — Output Schema

**Status:** Canonical  
**Source of truth for:** `src/lib/ai/output-schema.ts`

---

## Purpose

Defines the JSON schema the model must return. The application validates all model output against this schema before storing or displaying results.

## Required Top-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `mode` | enum | The mode used for this analysis run |
| `matter_summary` | object | Summary of matter context as understood by the model |
| `issues` | array | Identified legal issues |
| `governing_law` | array | Governing legal rules and their verification status |
| `authorities` | array | All authorities cited, with metadata and verification |
| `application` | object | Analysis, arguments, weaknesses, fact dependencies |
| `counterarguments` | array | Opposing arguments the model anticipates |
| `procedural_considerations` | array | Procedural risks and strategic considerations |
| `missing_facts` | array | Facts needed but not provided |
| `research_gaps` | array | Areas where further legal research is needed |
| `recommended_next_steps` | array | Actionable next steps |
| `confidence` | object | Model's self-assessed confidence and dependencies |
| `verification` | object | Verification metadata (unverified point counts, flags) |
| `disclaimer` | string | Model-generated disclaimer text |

## Optional Top-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `draft_output` | object or null | Structured draft document (memo, strategy note, factum section) |
| `comparison_matrix` | array or null | Point-by-point case comparison (case_comparison mode) |

## Authority Verification States

| State | Meaning |
|-------|---------|
| `verified` | Authority was provided by the user or retrieved from a trusted source |
| `provisional` | Authority follows a plausible format and is likely real but not confirmed |
| `unverified` | Authority cannot be confirmed; may require independent verification |

## Confidence Levels

| Level | Meaning |
|-------|---------|
| `high` | Well-supported by available authorities and clear legal framework |
| `moderate` | Supported but with gaps, open questions, or mixed authority |
| `low` | Significant uncertainty, missing facts, or unsettled law |

## Strength Assessments (Optional)

Only populated when `constraints.allow_rough_strength_assessment` is true.

| Value | Meaning |
|-------|---------|
| `strong` | Multiple supporting authorities, favorable facts |
| `moderate` | Some support but contestable |
| `mixed` | Arguments on both sides roughly balanced |
| `uncertain` | Insufficient information to assess |
| `weak` | Significant obstacles, adverse authority |

## Validation Rules

1. All required fields must be present
2. All enum values must match the defined options
3. `verification.unverified_point_count` must equal the actual count of authorities with `verification_status: "unverified"` or `"provisional"`
4. If `verification.contains_unverified_points` is `false`, there should be zero unverified/provisional authorities
5. `disclaimer` must not be empty
