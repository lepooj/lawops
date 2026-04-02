"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import type { CopilotOutput, Authority } from "@/lib/ai/output-schema";
import type { OutputStats } from "@/lib/ai/output-validator";

/**
 * Clean text for PDF rendering.
 * Strips control characters and soft hyphens that cause rendering artifacts.
 */
function cleanText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\u00AD/g, "")   // soft hyphens
    .replace(/\u200C/g, "")   // ZWNJ (from previous cleanText — clean up)
    .replace(/\u200B/g, "")   // zero-width space
    .replace(/\uFEFF/g, "");  // BOM
}

// === Styles ===
// Using Helvetica family throughout — avoids Times-Roman ligature encoding bugs

// Use only base Helvetica. Bold/italic via fontWeight/fontStyle, NOT separate font names.
// @react-pdf/renderer's WASM font engine has glyph corruption bugs with
// named variants (Helvetica-Bold, Helvetica-Oblique) in some browsers.
const FONT = "Helvetica";

const PAGE_PADDING_TOP = 60;
const PAGE_PADDING_BOTTOM = 72; // Extra space reserved for footer
const PAGE_PADDING_H = 64;
const s = StyleSheet.create({
  page: {
    paddingTop: PAGE_PADDING_TOP,
    paddingBottom: PAGE_PADDING_BOTTOM,
    paddingHorizontal: PAGE_PADDING_H,
    fontSize: 9.5,
    fontFamily: FONT,
    color: "#1a1a1a",
    lineHeight: 1.5,
  },
  // Header
  headerBlock: {
    marginBottom: 24,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: "#27272a",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#09090b",
    lineHeight: 1.3,
  },
  headerMeta: {
    fontSize: 8.5,
    color: "#52525b",
    marginBottom: 2,
    lineHeight: 1.35,
  },
  headerWatermark: {
    fontSize: 7,
    color: "#a1a1aa",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 8,
  },
  // Sections — wrap allowed, only headings kept with first content
  sectionWrap: {
    marginTop: 18,
  },
  sectionLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#09090b",
    paddingBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#d4d4d8",
  },
  subsectionTitle: {
    fontSize: 9.5,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 5,
    color: "#3f3f46",
  },
  // Body
  body: {
    fontSize: 9.5,
    lineHeight: 1.6,
    color: "#27272a",
    marginBottom: 5,
  },
  bodySmall: {
    fontSize: 8.5,
    lineHeight: 1.45,
    color: "#52525b",
    marginBottom: 3,
  },
  // Bullets
  bulletRow: {
    flexDirection: "row",
    marginBottom: 4,
    paddingLeft: 2,
  },
  bulletDot: {
    width: 10,
    fontSize: 9,
    color: "#71717a",
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.5,
    color: "#27272a",
  },
  // Cards — pure vertical stack, no flex-row (react-pdf flex-row causes overlap)
  card: {
    borderWidth: 0.5,
    borderColor: "#d4d4d8",
    borderRadius: 2,
    padding: 8,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#09090b",
    marginBottom: 2,
  },
  cardCitation: {
    fontSize: 8.5,
    color: "#52525b",
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 7.5,
    color: "#71717a",
    marginBottom: 3,
  },
  cardBody: {
    fontSize: 9,
    lineHeight: 1.45,
    color: "#3f3f46",
    marginTop: 2,
  },
  // Issues
  issueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderWidth: 0.5,
    borderColor: "#d4d4d8",
    borderRadius: 2,
    padding: 7,
    marginBottom: 4,
  },
  issueText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
    color: "#27272a",
    paddingRight: 6,
  },
  // Verification box
  verificationBox: {
    borderWidth: 0.5,
    borderColor: "#d4d4d8",
    borderRadius: 2,
    padding: 10,
  },
  // Confidence
  confidenceLabel: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#27272a",
  },
  confidenceReason: {
    fontSize: 9,
    color: "#3f3f46",
    lineHeight: 1.45,
    marginTop: 3,
  },
  // Disclaimer
  disclaimerBlock: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderTopColor: "#27272a",
  },
  disclaimerText: {
    fontSize: 8,
    color: "#71717a",
    lineHeight: 1.4,
    fontStyle: "italic",
  },
  // Footer — positioned in reserved bottom padding area
  pageFooter: {
    position: "absolute",
    bottom: 24,
    left: PAGE_PADDING_H,
    right: PAGE_PADDING_H,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: "#e4e4e7",
  },
  footerText: {
    fontSize: 6.5,
    color: "#a1a1aa",
  },
});

// === Document ===

function AnalysisPdfDocument({
  output,
  stats,
  completedAt,
  matterTitle,
}: {
  output: CopilotOutput;
  stats: OutputStats;
  completedAt: string | null;
  matterTitle?: string;
}) {
  let sectionNum = 0;
  const n = () => ++sectionNum;

  return (
    <Document
      title={cleanText(`Legal Analysis - ${matterTitle || output.matter_summary.requested_outcome}`)}
      author="LawOps"
      subject={`${output.mode} analysis`}
    >
      <Page size="LETTER" style={s.page} wrap>
        {/* Fixed footer on every page — lives in the reserved bottom padding */}
        <View style={s.pageFooter} fixed>
          <Text style={s.footerText}>
            {cleanText("LawOps - AI-Assisted Draft")}
          </Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>

        {/* Header */}
        <View style={s.headerBlock}>
          <Text style={s.headerTitle}>
            {cleanText(matterTitle || output.matter_summary.requested_outcome)}
          </Text>
          <Text style={s.headerMeta}>
            {cleanText(
              `${output.matter_summary.jurisdiction}  |  ${output.matter_summary.forum}`
            )}
          </Text>
          <Text style={s.headerMeta}>
            {cleanText(
              `${output.matter_summary.area_of_law.join(", ")}  |  ${output.mode.replace("_", " ")} analysis`
            )}
          </Text>
          {completedAt && (
            <Text style={s.headerMeta}>
              {cleanText(`Generated ${completedAt}`)}
            </Text>
          )}
          <Text style={s.headerWatermark}>
            AI-Assisted Draft — Verify All Authorities Before Reliance
          </Text>
        </View>

        {/* 1. Matter Summary */}
        <Sec num={n()} title="Matter Summary">
          <T style={s.body}>{output.matter_summary.summary}</T>
          <T style={s.bodySmall}>
            {cleanText(
              `Requested outcome: ${output.matter_summary.requested_outcome}`
            )}
          </T>
        </Sec>

        {/* 2. Issues */}
        <Sec num={n()} title="Issues to Decide">
          {output.issues.map((issue) => (
            <View key={issue.id} style={s.card} wrap={false}>
              <T style={s.body}>{issue.issue}</T>
              <Text style={s.cardMeta}>
                {cleanText(`${issue.importance} | ${issue.status.replace("_", " ")}`)}
              </Text>
            </View>
          ))}
          {output.issues.length === 0 && (
            <T style={s.bodySmall}>No issues identified.</T>
          )}
        </Sec>

        {/* 3. Governing Law */}
        <Sec num={n()} title="Governing Law">
          {output.governing_law.map((gl, i) => (
            <View key={i} style={s.card} wrap={false}>
              <T style={s.cardTitle}>{gl.topic}</T>
              <Text style={s.cardMeta}>
                {cleanText(`[${gl.verification_status.toUpperCase()}] ${gl.source_type.replace("_", " ")}`)}
              </Text>
              <T style={s.cardBody}>{gl.rule_statement}</T>
            </View>
          ))}
        </Sec>

        {/* 4. Authorities */}
        <Sec num={n()} title={`Authorities (${stats.totalAuthorities} cited)`}>
          {stats.totalAuthorities > 0 && (
            <Text style={s.cardMeta}>
              {[
                stats.verifiedAuthorities > 0 && `${stats.verifiedAuthorities} verified`,
                stats.provisionalAuthorities > 0 && `${stats.provisionalAuthorities} provisional`,
                stats.unverifiedAuthorities > 0 && `${stats.unverifiedAuthorities} unverified`,
              ].filter(Boolean).join(" | ")}
            </Text>
          )}
          {output.authorities.map((auth) => (
            <AuthCard key={auth.id} authority={auth} />
          ))}
          {output.authorities.length === 0 && (
            <T style={s.bodySmall}>No authorities cited.</T>
          )}
        </Sec>

        {/* 5. Application */}
        <Sec num={n()} title="Application to the Facts">
          <Text style={s.subsectionTitle}>Core Analysis</Text>
          <Bullets items={output.application.core_analysis} />
          <Text style={s.subsectionTitle}>Strongest Arguments</Text>
          <Bullets items={output.application.strongest_arguments} />
          <Text style={s.subsectionTitle}>Weaknesses</Text>
          <Bullets items={output.application.weaknesses} />
          {output.application.fact_dependencies.length > 0 && (
            <>
              <Text style={s.subsectionTitle}>Fact Dependencies</Text>
              <Bullets items={output.application.fact_dependencies} />
            </>
          )}
        </Sec>

        {/* 6. Counterarguments */}
        <Sec num={n()} title="Counterarguments">
          <Bullets items={output.counterarguments} />
        </Sec>

        {/* 7. Procedural */}
        <Sec num={n()} title="Procedural Considerations">
          <Bullets items={output.procedural_considerations} />
        </Sec>

        {/* 8. Missing Facts */}
        {output.missing_facts.length > 0 && (
          <Sec num={n()} title="Missing Facts">
            <Bullets items={output.missing_facts} />
          </Sec>
        )}

        {/* 9. Research Gaps */}
        {output.research_gaps.length > 0 && (
          <Sec num={n()} title="Research Gaps">
            <Bullets items={output.research_gaps} />
          </Sec>
        )}

        {/* 10. Next Steps */}
        <Sec num={n()} title="Recommended Next Steps">
          <Bullets items={output.recommended_next_steps} />
        </Sec>

        {/* 11. Confidence */}
        <Sec num={n()} title="Confidence Assessment">
          <Text style={s.confidenceLabel}>
            {cleanText(`Overall confidence: ${output.confidence.overall}`)}
          </Text>
          <T style={s.confidenceReason}>{output.confidence.reason}</T>
          {output.confidence.depends_on.length > 0 && (
            <>
              <Text
                style={{
                  ...s.bodySmall,
                  marginTop: 5,
                  fontWeight: "bold",
                }}
              >
                Depends on:
              </Text>
              <Bullets items={output.confidence.depends_on} />
            </>
          )}
        </Sec>

        {/* 12. Verification */}
        <Sec num={n()} title="Verification Status">
          <View style={s.verificationBox}>
            <T style={s.body}>
              {output.verification.needs_human_legal_review
                ? "This analysis requires human legal review before reliance."
                : "No mandatory review flags raised by the model."}
            </T>
            {output.verification.contains_unverified_points && (
              <Text
                style={{ ...s.bodySmall, color: "#b45309", marginTop: 3 }}
              >
                {cleanText(
                  `Contains ${output.verification.unverified_point_count} unverified point${output.verification.unverified_point_count !== 1 ? "s" : ""}. All authorities should be independently verified.`
                )}
              </Text>
            )}
            {output.verification.notes?.map((note, i) => (
              <T key={i} style={{ ...s.bodySmall, marginTop: 2 }}>
                {note}
              </T>
            ))}
          </View>
        </Sec>

        {/* Draft Output */}
        {output.draft_output && (
          <Sec
            num={n()}
            title={cleanText(
              output.draft_output.title || "Draft Output"
            )}
          >
            <T style={s.body}>{output.draft_output.body}</T>
            {output.draft_output.sections?.map((sec, i) => (
              <View key={i} style={{ marginTop: 8 }}>
                <Text style={s.subsectionTitle}>
                  {cleanText(sec.heading)}
                </Text>
                <T style={s.body}>{sec.content}</T>
              </View>
            ))}
          </Sec>
        )}

        {/* Disclaimer */}
        <View style={s.disclaimerBlock} wrap={false}>
          <Text style={s.disclaimerText}>
            {cleanText(output.disclaimer)}
          </Text>
          <Text style={{ ...s.disclaimerText, marginTop: 5 }}>
            {cleanText(
              "This document was generated by LawOps, an AI-assisted legal analysis tool. " +
                "All authorities, legal propositions, and strategic recommendations require " +
                "independent verification by a qualified legal professional before any reliance. " +
                "This is not legal advice."
            )}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

// === Helpers ===

/** Normalized text node — prevents ligature corruption in PDF text layer. */
import type { Style } from "@react-pdf/types";

function T({
  style,
  children,
}: {
  style?: Style | Style[];
  children: string;
}) {
  return <Text style={style}>{cleanText(children)}</Text>;
}

/** Section wrapper. Heading kept with first child via minPresenceAhead. */
function Sec({
  num,
  title,
  children,
}: {
  num: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.sectionWrap}>
      <View minPresenceAhead={40}>
        <Text style={s.sectionLabel}>Section {num}</Text>
        <Text style={s.sectionTitle}>{cleanText(title)}</Text>
      </View>
      {children}
    </View>
  );
}

function Bullets({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <T style={s.bodySmall}>None identified.</T>;
  }
  return (
    <View>
      {items.map((item, i) => (
        <View key={i} style={s.bulletRow} wrap={false}>
          <Text style={s.bulletDot}>-</Text>
          <T style={s.bulletText}>{item}</T>
        </View>
      ))}
    </View>
  );
}

function AuthCard({ authority }: { authority: Authority }) {
  const meta = [
    `[${authority.verification_status.toUpperCase()}]`,
    authority.court_or_source,
    authority.year,
    authority.weight,
    authority.treatment.replace("_", " "),
  ].filter(Boolean).join(" | ");

  return (
    <View style={s.card} wrap={false}>
      <T style={s.cardTitle}>{authority.title}</T>
      <Text style={s.cardCitation}>{cleanText(authority.citation)}</Text>
      <Text style={s.cardMeta}>{cleanText(meta)}</Text>
      <T style={s.cardBody}>{authority.relevance}</T>
      {authority.quoted_text && (
        <Text style={{ ...s.bodySmall, fontStyle: "italic", marginTop: 3, paddingLeft: 6 }}>
          {cleanText(
            `"${authority.quoted_text}"${authority.pinpoint ? ` at ${authority.pinpoint}` : ""}`
          )}
        </Text>
      )}
    </View>
  );
}


// === Export ===

export async function generateAnalysisPdf(
  output: CopilotOutput,
  stats: OutputStats,
  completedAt: string | null,
  matterTitle?: string
): Promise<Blob> {
  return await pdf(
    <AnalysisPdfDocument
      output={output}
      stats={stats}
      completedAt={completedAt}
      matterTitle={matterTitle}
    />
  ).toBlob();
}
