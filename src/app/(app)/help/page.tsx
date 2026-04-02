export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-zinc-100">
          User Guide
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Everything you need to operate the LawOps legal analysis workbench.
        </p>
      </div>

      {/* Table of Contents */}
      <nav className="mb-10 rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Contents
        </h2>
        <ol className="space-y-1.5 text-sm">
          <li>
            <a href="#overview" className="text-indigo-400 hover:text-indigo-300">
              1. Overview
            </a>
          </li>
          <li>
            <a href="#getting-started" className="text-indigo-400 hover:text-indigo-300">
              2. Getting Started
            </a>
          </li>
          <li>
            <a href="#matters" className="text-indigo-400 hover:text-indigo-300">
              3. Working with Matters
            </a>
          </li>
          <li>
            <a href="#intake" className="text-indigo-400 hover:text-indigo-300">
              4. Completing the Intake Form
            </a>
          </li>
          <li>
            <a href="#documents" className="text-indigo-400 hover:text-indigo-300">
              5. Uploading Documents
            </a>
          </li>
          <li>
            <a href="#analysis" className="text-indigo-400 hover:text-indigo-300">
              6. Running Analysis
            </a>
          </li>
          <li>
            <a href="#modes" className="text-indigo-400 hover:text-indigo-300">
              7. Analysis Modes
            </a>
          </li>
          <li>
            <a href="#reviewing" className="text-indigo-400 hover:text-indigo-300">
              8. Reviewing Results
            </a>
          </li>
          <li>
            <a href="#authorities" className="text-indigo-400 hover:text-indigo-300">
              9. Understanding Authorities &amp; Verification
            </a>
          </li>
          <li>
            <a href="#export" className="text-indigo-400 hover:text-indigo-300">
              10. Exporting &amp; Printing
            </a>
          </li>
          <li>
            <a href="#tips" className="text-indigo-400 hover:text-indigo-300">
              11. Tips &amp; Best Practices
            </a>
          </li>
          <li>
            <a href="#limits" className="text-indigo-400 hover:text-indigo-300">
              12. Limits &amp; Constraints
            </a>
          </li>
          <li>
            <a href="#troubleshooting" className="text-indigo-400 hover:text-indigo-300">
              13. Troubleshooting
            </a>
          </li>
        </ol>
      </nav>

      {/* Content */}
      <div className="space-y-12 text-sm leading-relaxed text-zinc-300">
        {/* 1. Overview */}
        <section id="overview">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">
            1. Overview
          </h2>
          <p>
            LawOps is a structured legal analysis workbench designed for
            Canadian litigation lawyers. It follows a controlled four-step
            workflow:
          </p>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {[
              { step: "1", label: "Create", desc: "Name and classify your matter" },
              { step: "2", label: "Intake", desc: "Enter structured legal context" },
              { step: "3", label: "Documents", desc: "Attach supporting files" },
              { step: "4", label: "Analyze", desc: "Generate AI-powered analysis" },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-md border border-zinc-800/60 bg-zinc-900/40 p-3 text-center"
              >
                <div className="mb-1 text-lg font-bold text-indigo-400">
                  {s.step}
                </div>
                <div className="text-xs font-medium text-zinc-200">
                  {s.label}
                </div>
                <div className="mt-1 text-[11px] text-zinc-500">
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4">
            The platform is not a chatbot or general Q&amp;A tool. It produces a
            structured legal memo with identified issues, governing law,
            authorities, counterarguments, and recommended next steps — all
            clearly labeled with verification status so you know exactly what
            needs independent confirmation.
          </p>
        </section>

        {/* 2. Getting Started */}
        <section id="getting-started">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">
            2. Getting Started
          </h2>
          <h3 className="mb-2 text-sm font-medium text-zinc-200">
            Logging In
          </h3>
          <p>
            Navigate to the login page and enter the email and password provided
            to you. Sessions last up to 8 hours, after which you will be
            prompted to log in again.
          </p>

          <h3 className="mb-2 mt-5 text-sm font-medium text-zinc-200">
            The Dashboard
          </h3>
          <p>
            After login you land on the <strong>Matters</strong> dashboard. This
            is your home screen — it lists all your matters with their status,
            type, jurisdiction, and last update time. Use the status filters
            (All, Active, Draft, Archived) to narrow the view.
          </p>
          <p className="mt-2">
            If you have no matters yet, you will see a welcome screen with a
            step-by-step overview of the workflow.
          </p>
        </section>

        {/* 3. Working with Matters */}
        <section id="matters">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">
            3. Working with Matters
          </h2>

          <h3 className="mb-2 text-sm font-medium text-zinc-200">
            Creating a Matter
          </h3>
          <p>
            Click <strong>New Matter</strong> on the dashboard. Enter a title
            (e.g., &quot;Singh v. Ontario Ministry&quot;) and select a type:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-zinc-400">
            <li><strong className="text-zinc-300">Litigation</strong> — active or anticipated litigation</li>
            <li><strong className="text-zinc-300">Regulatory</strong> — regulatory proceedings or compliance</li>
            <li><strong className="text-zinc-300">Advisory</strong> — legal opinions or advisory work</li>
            <li><strong className="text-zinc-300">Other</strong> — anything else</li>
          </ul>
          <p className="mt-2">
            After creation you are taken directly to the intake form.
          </p>

          <h3 className="mb-2 mt-5 text-sm font-medium text-zinc-200">
            Matter Statuses
          </h3>
          <ul className="list-inside list-disc space-y-1 text-zinc-400">
            <li>
              <strong className="text-zinc-300">Draft</strong> — initial state,
              intake in progress
            </li>
            <li>
              <strong className="text-zinc-300">Active</strong> — intake complete
              or analysis running/done
            </li>
            <li>
              <strong className="text-zinc-300">Archived</strong> — matter closed
              or completed
            </li>
          </ul>

          <h3 className="mb-2 mt-5 text-sm font-medium text-zinc-200">
            The Matter Workspace
          </h3>
          <p>
            Opening a matter brings you to a three-tab workspace:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-zinc-400">
            <li><strong className="text-zinc-300">Intake</strong> — structured legal context form</li>
            <li><strong className="text-zinc-300">Documents</strong> — file uploads and text extraction</li>
            <li><strong className="text-zinc-300">Analysis</strong> — AI-generated analysis viewer</li>
          </ul>
        </section>

        {/* 4. Intake Form */}
        <section id="intake">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">
            4. Completing the Intake Form
          </h2>
          <p>
            The intake form has 6 sections. Three are required before you can
            run analysis. A progress rail on the left shows your completion
            status.
          </p>

          <div className="mt-4 space-y-5">
            <div className="rounded-md border border-zinc-800/60 bg-zinc-900/40 p-4">
              <div className="flex items-center gap-2">
                <span className="rounded bg-red-900/40 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
                  Required
                </span>
                <h4 className="font-medium text-zinc-200">
                  Section 1: Jurisdiction &amp; Forum
                </h4>
              </div>
              <p className="mt-2 text-zinc-400">
                Select the province/territory, jurisdiction type (Provincial or
                Federal), court level, and area of law. The province field is
                required for analysis readiness.
              </p>
            </div>

            <div className="rounded-md border border-zinc-800/60 bg-zinc-900/40 p-4">
              <div className="flex items-center gap-2">
                <span className="rounded bg-red-900/40 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
                  Required
                </span>
                <h4 className="font-medium text-zinc-200">
                  Section 2: Facts &amp; Parties
                </h4>
              </div>
              <p className="mt-2 text-zinc-400">
                Write the fact narrative (up to 5,000 characters). At least 10
                characters are needed for readiness. Add parties with their names
                and roles (Plaintiff, Defendant, Applicant, Respondent, etc.).
              </p>
            </div>

            <div className="rounded-md border border-zinc-800/60 bg-zinc-900/40 p-4">
              <div className="flex items-center gap-2">
                <span className="rounded bg-red-900/40 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
                  Required
                </span>
                <h4 className="font-medium text-zinc-200">
                  Section 3: Legal Objective
                </h4>
              </div>
              <p className="mt-2 text-zinc-400">
                Describe the desired outcome (at least 5 characters required).
                Optionally note constraints such as budget limitations, time
                sensitivity, or relationship considerations.
              </p>
            </div>

            <div className="rounded-md border border-zinc-800/60 bg-zinc-900/40 p-4">
              <div className="flex items-center gap-2">
                <span className="rounded bg-zinc-700/60 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                  Optional
                </span>
                <h4 className="font-medium text-zinc-200">
                  Section 4: Procedural History
                </h4>
              </div>
              <p className="mt-2 text-zinc-400">
                Select the current procedural stage, describe prior decisions or
                orders, and add key dates. This enriches the analysis with
                procedural context.
              </p>
            </div>

            <div className="rounded-md border border-zinc-800/60 bg-zinc-900/40 p-4">
              <div className="flex items-center gap-2">
                <span className="rounded bg-zinc-700/60 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                  Optional
                </span>
                <h4 className="font-medium text-zinc-200">
                  Section 5: Known Authorities
                </h4>
              </div>
              <p className="mt-2 text-zinc-400">
                Add supporting authorities (case name, citation, relevance) that
                you already know. These will be labeled &quot;User Provided&quot; in the
                analysis output. You can also enter known opposing arguments and
                opposing authorities.
              </p>
            </div>

            <div className="rounded-md border border-zinc-800/60 bg-zinc-900/40 p-4">
              <div className="flex items-center gap-2">
                <span className="rounded bg-zinc-700/60 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                  Optional
                </span>
                <h4 className="font-medium text-zinc-200">
                  Section 6: Documents
                </h4>
              </div>
              <p className="mt-2 text-zinc-400">
                Links to the Documents tab where you can upload supporting files.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-md border border-indigo-900/40 bg-indigo-950/20 p-4">
            <p className="text-sm text-indigo-300">
              <strong>Auto-save:</strong> The form saves automatically as you
              type (after a brief pause). You will see a &quot;Saved&quot; indicator
              confirming your changes were persisted. You can navigate between
              sections freely without losing work.
            </p>
          </div>
        </section>

        {/* 5. Documents */}
        <section id="documents">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">
            5. Uploading Documents
          </h2>
          <p>
            The Documents tab lets you attach supporting files that will be
            included in the analysis. Documents are optional — you can run
            analysis without them.
          </p>

          <h3 className="mb-2 mt-5 text-sm font-medium text-zinc-200">
            Supported Formats
          </h3>
          <ul className="list-inside list-disc space-y-1 text-zinc-400">
            <li><strong className="text-zinc-300">PDF</strong> — text-based PDFs (scanned/image PDFs may have limited extraction)</li>
            <li><strong className="text-zinc-300">DOCX</strong> — Microsoft Word documents</li>
            <li><strong className="text-zinc-300">TXT</strong> — plain text files</li>
            <li><strong className="text-zinc-300">Images</strong> — JPG, PNG, HEIC (text extracted via OCR)</li>
          </ul>

          <h3 className="mb-2 mt-5 text-sm font-medium text-zinc-200">
            Upload Limits
          </h3>
          <ul className="list-inside list-disc space-y-1 text-zinc-400">
            <li>Maximum <strong className="text-zinc-300">5 documents</strong> per matter</li>
            <li>Maximum <strong className="text-zinc-300">25 MB</strong> per file</li>
          </ul>

          <h3 className="mb-2 mt-5 text-sm font-medium text-zinc-200">
            Text Extraction
          </h3>
          <p>
            When you upload a document, the system automatically extracts its
            text content. This extracted text is what gets sent to the AI model
            during analysis (truncated to 3,000 characters per document).
          </p>
          <p className="mt-2">
            Each document shows an extraction status:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-zinc-400">
            <li><strong className="text-zinc-300">Extracted</strong> — text successfully extracted</li>
            <li><strong className="text-zinc-300">OCR</strong> — text extracted via image recognition (may show confidence %)</li>
            <li><strong className="text-zinc-300">Pending</strong> — extraction not yet attempted</li>
            <li><strong className="text-zinc-300">Failed</strong> — extraction failed (you can retry)</li>
          </ul>

          <h3 className="mb-2 mt-5 text-sm font-medium text-zinc-200">
            Document Controls
          </h3>
          <ul className="list-inside list-disc space-y-1 text-zinc-400">
            <li>
              <strong className="text-zinc-300">Include in Analysis</strong> —
              toggle whether each document is sent to the AI model
            </li>
            <li>
              <strong className="text-zinc-300">Document Type</strong> — classify
              as Pleading, Evidence, Case Law, Statute, Correspondence, or Other
            </li>
            <li>
              <strong className="text-zinc-300">Extract Text / Process All</strong> —
              manually trigger extraction for pending documents
            </li>
            <li>
              <strong className="text-zinc-300">Delete</strong> — permanently remove
              a document
            </li>
          </ul>
        </section>

        {/* 6. Running Analysis */}
        <section id="analysis">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">
            6. Running Analysis
          </h2>

          <h3 className="mb-2 text-sm font-medium text-zinc-200">
            Prerequisites
          </h3>
          <p>
            The <strong>Run Analysis</strong> button becomes enabled when the
            three required intake sections are complete:
          </p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-zinc-400">
            <li>Province/territory selected</li>
            <li>Fact narrative has at least 10 characters</li>
            <li>Desired outcome has at least 5 characters</li>
          </ol>

          <h3 className="mb-2 mt-5 text-sm font-medium text-zinc-200">
            Running
          </h3>
          <p>
            Select an analysis mode (see next section), then click{" "}
            <strong>Run Analysis</strong>. Generation typically takes 30–90
            seconds. The system sends your intake data and included document
            text to the AI model in a single structured call.
          </p>
          <p className="mt-2">
            You can re-run analysis at any time — for example after updating
            the intake, adding documents, or choosing a different mode. Each run
            is numbered.
          </p>
        </section>

        {/* 7. Analysis Modes */}
        <section id="modes">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">
            7. Analysis Modes
          </h2>
          <p>
            Select a mode from the dropdown before running analysis. Each mode
            shapes the focus and structure of the output.
          </p>

          <div className="mt-4 space-y-4">
            <div className="rounded-md border border-zinc-800/60 bg-zinc-900/40 p-4">
              <h4 className="font-medium text-zinc-200">Legal Memo</h4>
              <span className="text-[11px] text-zinc-500">Default mode</span>
              <p className="mt-2 text-zinc-400">
                Balanced analysis for internal review. Identifies issues,
                governing law, application to facts, counterarguments, and
                research gaps. Does not advocate strongly for either side.
              </p>
            </div>

            <div className="rounded-md border border-zinc-800/60 bg-zinc-900/40 p-4">
              <h4 className="font-medium text-zinc-200">
                Litigation Strategy
              </h4>
              <p className="mt-2 text-zinc-400">
                Advocacy planning and preparation. Focuses on strongest
                arguments, expected attacks, procedural leverage, and
                evidentiary needs. More argumentative but remains
                source-disciplined.
              </p>
            </div>

            <div className="rounded-md border border-zinc-800/60 bg-zinc-900/40 p-4">
              <h4 className="font-medium text-zinc-200">Case Comparison</h4>
              <p className="mt-2 text-zinc-400">
                Compare your matter against authorities. Outputs a comparison
                matrix showing factual similarities/differences and whether each
                authority helps, hurts, or is distinguishable. Best used when
                you have entered known authorities in the intake.
              </p>
            </div>

            <div className="rounded-md border border-zinc-800/60 bg-zinc-900/40 p-4">
              <h4 className="font-medium text-zinc-200">Draft Factum</h4>
              <p className="mt-2 text-zinc-400">
                Generates a factum skeleton or argument section draft in
                Canadian appellate style. Flags all propositions needing
                verification. This is a work-product starting point, not a
                finished filing.
              </p>
            </div>
          </div>
        </section>

        {/* 8. Reviewing Results */}
        <section id="reviewing">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">
            8. Reviewing Results
          </h2>
          <p>
            Completed analysis is displayed in a structured viewer with a table
            of contents on the left and section content on the right.
          </p>

          <h3 className="mb-2 mt-5 text-sm font-medium text-zinc-200">
            Analysis Sections
          </h3>
          <p>
            Depending on the mode, you may see some or all of:
          </p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-zinc-400">
            <li>Matter Summary — overview with jurisdiction and forum tags</li>
            <li>Issues to Decide — identified issues with importance and status</li>
            <li>Governing Law — rule statements with verification status</li>
            <li>Authorities — cited cases with court, year, weight, and treatment</li>
            <li>Application to the Facts — core analysis, arguments, and weaknesses</li>
            <li>Counterarguments — expected opposing arguments</li>
            <li>Procedural Considerations — procedural risks and opportunities</li>
            <li>Missing Facts — information gaps for stronger analysis</li>
            <li>Research Gaps — areas requiring further legal research</li>
            <li>Recommended Next Steps — actionable next moves</li>
            <li>Confidence Assessment — overall confidence level and reasoning</li>
            <li>Verification Status — what requires human review</li>
          </ol>

          <h3 className="mb-2 mt-5 text-sm font-medium text-zinc-200">
            Run Metadata
          </h3>
          <p>
            At the top of the analysis, a metadata bar shows the run number, AI
            model used, generation time, and timestamp.
          </p>

          <h3 className="mb-2 mt-5 text-sm font-medium text-zinc-200">
            Warnings
          </h3>
          <p>
            The viewer may display amber warning banners if:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-zinc-400">
            <li>No authorities were cited</li>
            <li>All authorities are unverified</li>
            <li>Governing law sources are unverified</li>
            <li>Documents had OCR extraction issues</li>
          </ul>
        </section>

        {/* 9. Authorities & Verification */}
        <section id="authorities">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">
            9. Understanding Authorities &amp; Verification
          </h2>
          <p>
            Every authority cited in the analysis carries a provenance label so
            you know its origin and reliability.
          </p>

          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 rounded bg-emerald-900/40 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                Verified
              </span>
              <p className="text-zinc-400">
                You have independently confirmed this authority exists and is
                relevant. Updated by the lawyer during review.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 rounded bg-amber-900/40 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                User Provided
              </span>
              <p className="text-zinc-400">
                You entered this authority in the intake form. It was passed to
                the AI model as context.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 rounded bg-red-900/40 px-2 py-0.5 text-[11px] font-medium text-red-400">
                Unverified
              </span>
              <p className="text-zinc-400">
                AI-generated. Not independently confirmed. This is the default
                for all AI-cited authorities. You must verify these before
                reliance.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 rounded bg-orange-900/40 px-2 py-0.5 text-[11px] font-medium text-orange-400">
                Flagged
              </span>
              <p className="text-zinc-400">
                You suspect fabrication or misapplication of this authority.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-md border border-amber-900/40 bg-amber-950/20 p-4">
            <p className="text-sm text-amber-300">
              <strong>Important:</strong> AI models can generate plausible but
              non-existent case citations. Always verify authorities through
              CanLII, Westlaw, or Lexis before relying on them in any filing or
              advice.
            </p>
          </div>
        </section>

        {/* 10. Export & Print */}
        <section id="export">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">
            10. Exporting &amp; Printing
          </h2>
          <p>
            The analysis viewer sidebar includes two export options:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-zinc-400">
            <li>
              <strong className="text-zinc-300">Export PDF</strong> — generates a
              professionally formatted PDF memo with legal formatting and
              disclaimers
            </li>
            <li>
              <strong className="text-zinc-300">Print</strong> — opens your
              browser&apos;s print dialog with print-optimized styles (black and
              white, adjusted spacing)
            </li>
          </ul>
          <p className="mt-2">
            Both outputs include the standard disclaimer footer:
            &quot;AI-generated analysis. Verify all authorities before reliance.&quot;
          </p>
        </section>

        {/* 11. Tips */}
        <section id="tips">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">
            11. Tips &amp; Best Practices
          </h2>
          <ul className="list-inside list-disc space-y-2 text-zinc-400">
            <li>
              <strong className="text-zinc-300">Be specific in the fact narrative.</strong>{" "}
              The more factual detail you provide, the more targeted the
              analysis. Include dates, amounts, key communications, and
              procedural steps.
            </li>
            <li>
              <strong className="text-zinc-300">Add known authorities.</strong>{" "}
              If you already know relevant cases, enter them in Section 5. The
              AI will incorporate them and they will be labeled &quot;User Provided&quot;
              for clear provenance.
            </li>
            <li>
              <strong className="text-zinc-300">Upload text-based PDFs.</strong>{" "}
              Scanned/image PDFs may produce poor extraction results. If
              possible, use the original digital version of court filings.
            </li>
            <li>
              <strong className="text-zinc-300">Try different modes.</strong>{" "}
              Run the same matter through Legal Memo for balanced analysis, then
              Litigation Strategy for advocacy planning. Each mode surfaces
              different insights.
            </li>
            <li>
              <strong className="text-zinc-300">Check the verification summary.</strong>{" "}
              The sidebar shows counts of verified, provisional, and unverified
              authorities at a glance. Prioritize verifying the unverified ones.
            </li>
            <li>
              <strong className="text-zinc-300">Complete optional sections.</strong>{" "}
              Procedural history and known authorities are optional, but they
              meaningfully improve analysis quality. The AI can account for
              procedural stage, timing, and existing case law when you provide
              them.
            </li>
          </ul>
        </section>

        {/* 12. Limits */}
        <section id="limits">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">
            12. Limits &amp; Constraints
          </h2>
          <table className="mt-2 w-full text-sm">
            <tbody className="divide-y divide-zinc-800/60">
              <tr>
                <td className="py-2 pr-4 text-zinc-400">Fact narrative</td>
                <td className="py-2 text-zinc-300">5,000 characters max</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-zinc-400">Documents per matter</td>
                <td className="py-2 text-zinc-300">5 files max</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-zinc-400">File size</td>
                <td className="py-2 text-zinc-300">25 MB per file</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-zinc-400">Accepted formats</td>
                <td className="py-2 text-zinc-300">PDF, DOCX, TXT, JPG, PNG, HEIC</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-zinc-400">Document text sent to AI</td>
                <td className="py-2 text-zinc-300">3,000 characters per document</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-zinc-400">Session duration</td>
                <td className="py-2 text-zinc-300">8 hours</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-zinc-400">Analysis time</td>
                <td className="py-2 text-zinc-300">30–90 seconds typical</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 13. Troubleshooting */}
        <section id="troubleshooting">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">
            13. Troubleshooting
          </h2>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-zinc-200">
                &quot;Run Analysis&quot; button is disabled
              </h4>
              <p className="mt-1 text-zinc-400">
                Complete the three required intake sections: select a province,
                write a fact narrative (10+ characters), and enter a desired
                outcome (5+ characters). The readiness indicator at the bottom
                of the intake sidebar will turn green when ready.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-zinc-200">
                Analysis failed or timed out
              </h4>
              <p className="mt-1 text-zinc-400">
                Click Run Analysis again to retry. If the error persists,
                check that your fact narrative is not excessively long and
                that your documents have extracted successfully.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-zinc-200">
                Document extraction failed
              </h4>
              <p className="mt-1 text-zinc-400">
                Click the &quot;Extract Text&quot; button to retry. Scanned PDFs
                (image-only) may not extract well. Try using a text-based
                version of the document instead.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-zinc-200">
                Session expired
              </h4>
              <p className="mt-1 text-zinc-400">
                Sessions last 8 hours. If redirected to the login page, log in
                again. Your matter data is saved — nothing is lost.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-zinc-200">
                OCR confidence is low
              </h4>
              <p className="mt-1 text-zinc-400">
                Image documents with low OCR confidence (below 70%) will show a
                warning. The extracted text may be unreliable. Consider using a
                text-based format instead or toggling the document off from
                analysis inclusion.
              </p>
            </div>
          </div>
        </section>

        {/* Footer disclaimer */}
        <div className="mt-12 border-t border-zinc-800/60 pt-6">
          <p className="text-xs text-zinc-600">
            LawOps is an AI-assisted analysis tool. All output should be
            treated as a draft starting point. Verify all authorities,
            propositions of law, and factual assertions before reliance.
            Controlled pilot v0.1.
          </p>
        </div>
      </div>
    </div>
  );
}
