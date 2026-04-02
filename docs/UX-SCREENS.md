# UX Screens

## Screen Map

4 screens + 1 modal. That's it.

```
/login                  → Login
/dashboard              → Matter list
/matters/[id]/intake    → Intake form (6 sections)
/matters/[id]/analysis  → Analysis viewer (10 sections)
/matters/[id]/documents → Document management
+ Export modal (overlay on analysis)
```

## Login

- Dark theme. "LawCopilot" wordmark. No tagline.
- Email + password fields. Sign-in button.
- No registration link (accounts pre-created).
- No password reset (handled manually for pilot).
- Redirect to dashboard on success.

## Dashboard — Matter List

```
┌─────────────────────────────────────────────────────────┐
│  LawCopilot                                 [user@firm] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Matters                              [+ New Matter]    │
│                                                         │
│  [Active] [Draft] [Archived]                            │
│                                                         │
│  Title              Jurisdiction  Status   Last Updated │
│  ─────────────────────────────────────────────────────  │
│  Singh v. Ontario   ON Superior   Active   Mar 28       │
│  R. v. Patel        BC Provincial Draft    Mar 15       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- Status filter tabs: Active / Draft / Archived
- Create matter: inline modal (title + matter type dropdown)
- Click row → open matter workspace

## Matter Workspace — Tab Layout

Three tabs: **Intake** | **Analysis** | **Documents**

Tab bar at top of workspace. Matter title in header. Back to dashboard link.

## Intake Tab — Structured Form

```
┌─ Progress Rail ──┐  ┌─ Current Section Form ──────────────┐
│                   │  │                                      │
│  ✓ Jurisdiction   │  │  [Form fields for active section]    │
│  ● Facts & Parties│  │                                      │
│  ○ Legal Objective│  │                                      │
│  ○ Procedural Hx  │  │                                      │
│  ○ Authorities    │  │                                      │
│  ○ Documents      │  │                                      │
│                   │  │                                      │
└───────────────────┘  └──────────────────────────────────────┘

Bottom: [Save Draft]  [Next →]  [Run Analysis] (active when 3 required done)
```

### 6 Sections

| #   | Section              | Required | Key Fields                                                                                                |
| --- | -------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| 1   | Jurisdiction & Forum | Yes      | Province (dropdown), Court level (dropdown), Federal/Provincial toggle, Area of law (searchable dropdown) |
| 2   | Facts & Parties      | Yes      | Fact narrative (Tiptap rich text, 5000 chars), Parties (name + role structured list)                      |
| 3   | Legal Objective      | Yes      | Desired outcome (text), Constraints (text, optional)                                                      |
| 4   | Procedural History   | No       | Current stage (dropdown), Prior decisions (text), Key dates (date + event pairs)                          |
| 5   | Known Authorities    | No       | Supporting cases (structured), Opposing arguments (text), Opposing cases (structured)                     |
| 6   | Documents            | No       | Drag-drop upload, type label per file                                                                     |

### UX Details

- Placeholder text with realistic Canadian legal examples
- Province auto-adjusts court level options
- Area of law is searchable dropdown
- Required vs optional clearly indicated
- Auto-save on field blur (debounced)
- "Run Analysis" activates when 3 required sections complete

## Analysis Tab — Viewer

```
┌─ Contents (sticky) ─┐  ┌─ Section Detail ───────────────────┐
│                      │  │                                     │
│  1. Executive Assess.│  │  2. Issues to Decide                │
│  2. Issues to Decide │  │  ════════════════════                │
│  3. Governing Law    │  │                                     │
│  4. Application      │  │  Summary: Three primary issues...   │
│  5. Arguments For    │  │                                     │
│  6. Counterarguments │  │  [Detailed analysis in serif font   │
│  7. Procedural Strat.│  │   with inline citation markers¹     │
│  8. Authority Map    │  │   that are clickable]               │
│  9. Risk Analysis    │  │                                     │
│  10. Work Product    │  │  Review: [Unreviewed ▾]             │
│                      │  │                                     │
│  3/10 reviewed       │  └─────────────────────────────────────┘
└──────────────────────┘

⚖ AI-generated analysis. Verify all authorities before reliance.
```

- Sections collapsible (summary + expandable detail)
- Serif font (Source Serif 4) for legal content
- Inline citation markers (superscript, clickable)
- Per-section review dropdown
- TOC shows review progress

### Citation Slide-Over

Click citation → slide-over panel:

- Full citation text
- Court + year
- Provenance badge (USER_PROVIDED / UNVERIFIED / VERIFIED / FLAGGED)
- Which section cites it
- Legal proposition it supports
- [Mark Verified] and [Flag] buttons

## Documents Tab

```
┌──────────────────────────────────────────────┐
│  Documents                                    │
│                                               │
│  ┌──────────────────────────────────────────┐│
│  │  Drop PDF, DOCX, or TXT files here      ││
│  └──────────────────────────────────────────┘│
│                                               │
│  Statement of Claim  │ Pleading │ 2.1MB │ ✓  │
│  Termination Letter  │ Evidence │ 450KB │ ✓  │
│  Employment Act      │ Statute  │ 1.8MB │ ⚠  │
└──────────────────────────────────────────────┘
```

## Export Modal

```
┌────────────────────────────────────┐
│  Export Analysis                    │
│                                    │
│  Format: PDF                       │
│  Sections: [✓ All] or checkboxes   │
│  Include confidence labels: [✓]    │
│                                    │
│  [Generate PDF]        [Cancel]    │
└────────────────────────────────────┘
```

- Warning if unreviewed sections: "3 sections unreviewed. Export anyway?"
- Options: Export All / Export Reviewed Only / Cancel
- PDF includes: header, sections, footnotes for authorities, confidence labels, watermark ("AI-ASSISTED DRAFT")

## Visual Standards

- **Dark theme only.** No light mode.
- **Serif** (Source Serif 4) for legal analysis content
- **Sans-serif** (Inter) for UI chrome
- **3-tier surfaces:** Page (darkest) → Surface → Elevated
- **Loading states** on every async operation
- **Error states** that explain what happened
- **Empty states** that guide forward
