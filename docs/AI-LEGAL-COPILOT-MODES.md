# AI Legal CoPilot — Analysis Modes

**Status:** Canonical  
**Source of truth for:** `src/lib/ai/modes.ts`

---

## Available Modes

### memo

**Purpose:** Balanced legal memo for internal legal review.

**Prioritizes:**
- Issue identification
- Governing law
- Application to facts
- Counterarguments
- Research gaps
- Procedural risks

**Instruction:** Prioritize balanced legal analysis suitable for internal review. Do not advocate one side too aggressively unless explicitly asked. Emphasize issue framing, governing law, application to facts, weaknesses, and research gaps. Where uncertainty exists, surface it clearly rather than smoothing it over.

---

### strategy

**Purpose:** Litigation or advocacy planning.

**Prioritizes:**
- Strongest arguments
- Expected attacks
- Procedural leverage points
- Evidentiary needs
- Record-building
- Sequencing

**Instruction:** Prioritize strategic usefulness. Identify strongest available arguments, likely counterarguments, procedural choke points, evidentiary vulnerabilities, and leverage opportunities. You may assess relative argument strength qualitatively, but remain cautious and source-disciplined. Do not promise outcomes and do not overstate incomplete law.

---

### case_comparison

**Purpose:** Compare current matter against one or more authorities.

**Prioritizes:**
- Factual similarities
- Factual differences
- Governing test
- Binding vs persuasive weight
- Analogical usefulness
- Whether the authority helps or hurts

**Instruction:** Prioritize analogical analysis. For each authority, identify material similarities, material differences, legal test alignment, weight of authority, and whether the case is likely helpful, distinguishable, adverse, or mixed. Avoid superficial comparisons. Focus on the facts and legal features that genuinely affect applicability.

---

### draft_factum

**Purpose:** Draft a factum skeleton or section draft.

**Prioritizes:**
- Structured advocacy
- Issues
- Legal test
- Application
- Relief
- Careful citation handling

**Instruction:** Draft in a professional Canadian appellate or motion-writing style, but remain source-disciplined. Prefer a factum skeleton, argument section, or structured draft rather than polished unsupported rhetoric. Do not fabricate authorities, quotations, or pinpoints. Flag all propositions that still require citation verification. Where the record or authorities are incomplete, say so directly inside the draft in a professional way.

---

## Mode Selection

The mode is selected by the user before triggering an analysis run. The default mode for the pilot is `memo`. Mode selection is passed to the model via the runtime template's `mode` field.
