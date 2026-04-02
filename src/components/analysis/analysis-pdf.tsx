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

// === Styles ===

const s = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 64,
    fontSize: 10,
    fontFamily: "Times-Roman",
    color: "#1a1a1a",
    lineHeight: 1.55,
  },
  // Header (first page)
  headerBlock: {
    marginBottom: 28,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#18181b",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Times-Bold",
    marginBottom: 6,
    color: "#09090b",
  },
  headerMeta: {
    fontSize: 9,
    color: "#52525b",
    marginBottom: 2,
    lineHeight: 1.4,
  },
  headerWatermark: {
    fontSize: 7.5,
    color: "#a1a1aa",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 10,
    fontFamily: "Helvetica",
  },
  // Section titles
  sectionNumber: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Times-Bold",
    marginBottom: 10,
    color: "#09090b",
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#d4d4d8",
  },
  sectionWrap: {
    marginTop: 22,
  },
  subsectionTitle: {
    fontSize: 10.5,
    fontFamily: "Times-Bold",
    marginTop: 14,
    marginBottom: 6,
    color: "#27272a",
  },
  // Body text
  body: {
    fontSize: 10.5,
    lineHeight: 1.65,
    color: "#27272a",
    marginBottom: 6,
    fontFamily: "Times-Roman",
  },
  bodySmall: {
    fontSize: 9,
    lineHeight: 1.5,
    color: "#3f3f46",
    marginBottom: 4,
  },
  // Bullets
  bulletRow: {
    flexDirection: "row",
    marginBottom: 5,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 14,
    fontSize: 10,
    color: "#71717a",
    fontFamily: "Times-Roman",
  },
  bulletText: {
    flex: 1,
    fontSize: 10.5,
    lineHeight: 1.55,
    color: "#27272a",
    fontFamily: "Times-Roman",
  },
  // Cards
  card: {
    borderWidth: 0.5,
    borderColor: "#d4d4d8",
    borderRadius: 3,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#fafafa",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 10.5,
    fontFamily: "Times-Bold",
    color: "#09090b",
    flex: 1,
    paddingRight: 8,
  },
  cardCitation: {
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#52525b",
    marginTop: 1,
  },
  cardMeta: {
    fontSize: 8,
    fontFamily: "Helvetica",
    color: "#71717a",
    marginTop: 4,
  },
  cardBody: {
    fontSize: 9.5,
    lineHeight: 1.5,
    color: "#3f3f46",
    marginTop: 4,
    fontFamily: "Times-Roman",
  },
  // Badges
  badge: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    color: "#fff",
  },
  badgeVerified: { backgroundColor: "#059669" },
  badgeProvisional: { backgroundColor: "#d97706" },
  badgeUnverified: { backgroundColor: "#dc2626" },
  // Tags
  tag: {
    fontSize: 7.5,
    fontFamily: "Helvetica",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
    backgroundColor: "#f4f4f5",
    color: "#52525b",
  },
  tagRow: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
    marginTop: 2,
  },
  // Issue row
  issueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderWidth: 0.5,
    borderColor: "#d4d4d8",
    borderRadius: 3,
    padding: 8,
    marginBottom: 5,
    backgroundColor: "#fafafa",
  },
  issueText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.45,
    color: "#27272a",
    fontFamily: "Times-Roman",
    paddingRight: 8,
  },
  // Verification box
  verificationBox: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 4,
    padding: 12,
    backgroundColor: "#fafafa",
  },
  // Confidence
  confidenceLabel: {
    fontSize: 10.5,
    fontFamily: "Times-Bold",
    color: "#27272a",
  },
  confidenceReason: {
    fontSize: 10,
    color: "#3f3f46",
    lineHeight: 1.5,
    marginTop: 3,
    fontFamily: "Times-Roman",
  },
  // Disclaimer
  disclaimerBlock: {
    marginTop: 28,
    paddingTop: 14,
    borderTopWidth: 2,
    borderTopColor: "#18181b",
  },
  disclaimerText: {
    fontSize: 8.5,
    color: "#71717a",
    lineHeight: 1.45,
    fontFamily: "Times-Italic",
  },
  // Footer
  pageFooter: {
    position: "absolute",
    bottom: 28,
    left: 64,
    right: 64,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#e4e4e7",
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: "#a1a1aa",
    fontFamily: "Helvetica",
  },
});

// === PDF Document ===

function AnalysisPdfDocument({
  output,
  stats,
  completedAt,
}: {
  output: CopilotOutput;
  stats: OutputStats;
  completedAt: string | null;
}) {
  let sectionNum = 0;

  function nextSection() {
    sectionNum++;
    return sectionNum;
  }

  return (
    <Document
      title={`Legal Analysis — ${output.matter_summary.task}`}
      author="LawOps"
      subject={`${output.mode} analysis`}
    >
      <Page size="LETTER" style={s.page} wrap>
        {/* Header */}
        <View style={s.headerBlock} fixed={false}>
          <Text style={s.headerTitle}>
            {output.matter_summary.task}
          </Text>
          <Text style={s.headerMeta}>
            {output.matter_summary.jurisdiction} · {output.matter_summary.forum}
          </Text>
          <Text style={s.headerMeta}>
            {output.matter_summary.area_of_law.join(", ")} · {output.mode.replace("_", " ")} analysis
          </Text>
          {completedAt && (
            <Text style={s.headerMeta}>Generated {completedAt}</Text>
          )}
          <Text style={s.headerWatermark}>
            AI-Assisted Draft — Verify All Authorities Before Reliance
          </Text>
        </View>

        {/* Matter Summary */}
        <Section num={nextSection()} title="Matter Summary">
          <Text style={s.body}>{output.matter_summary.summary}</Text>
          <Text style={s.bodySmall}>
            Requested outcome: {output.matter_summary.requested_outcome}
          </Text>
        </Section>

        {/* Issues */}
        <Section num={nextSection()} title="Issues to Decide">
          {output.issues.map((issue) => (
            <View key={issue.id} style={s.issueRow}>
              <Text style={s.issueText}>{issue.issue}</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <Text style={s.tag}>{issue.importance}</Text>
                <Text style={s.tag}>{issue.status.replace("_", " ")}</Text>
              </View>
            </View>
          ))}
          {output.issues.length === 0 && (
            <Text style={s.bodySmall}>No issues identified.</Text>
          )}
        </Section>

        {/* Governing Law */}
        <Section num={nextSection()} title="Governing Law">
          {output.governing_law.map((gl, i) => (
            <View key={i} style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.cardTitle}>{gl.topic}</Text>
                <VerificationBadge status={gl.verification_status} />
              </View>
              <Text style={s.cardBody}>{gl.rule_statement}</Text>
              <Text style={s.cardMeta}>Source: {gl.source_type.replace("_", " ")}</Text>
            </View>
          ))}
        </Section>

        {/* Authorities */}
        <Section
          num={nextSection()}
          title={`Authorities (${stats.totalAuthorities} cited)`}
        >
          <View style={{ ...s.tagRow, marginBottom: 8 }}>
            {stats.verifiedAuthorities > 0 && (
              <Text style={{ ...s.badge, ...s.badgeVerified }}>
                {stats.verifiedAuthorities} verified
              </Text>
            )}
            {stats.provisionalAuthorities > 0 && (
              <Text style={{ ...s.badge, ...s.badgeProvisional }}>
                {stats.provisionalAuthorities} provisional
              </Text>
            )}
            {stats.unverifiedAuthorities > 0 && (
              <Text style={{ ...s.badge, ...s.badgeUnverified }}>
                {stats.unverifiedAuthorities} unverified
              </Text>
            )}
          </View>
          {output.authorities.map((auth) => (
            <AuthorityCard key={auth.id} authority={auth} />
          ))}
          {output.authorities.length === 0 && (
            <Text style={s.bodySmall}>No authorities cited.</Text>
          )}
        </Section>

        {/* Application */}
        <Section num={nextSection()} title="Application to the Facts">
          <Text style={s.subsectionTitle}>Core Analysis</Text>
          <BulletList items={output.application.core_analysis} />
          <Text style={s.subsectionTitle}>Strongest Arguments</Text>
          <BulletList items={output.application.strongest_arguments} />
          <Text style={s.subsectionTitle}>Weaknesses</Text>
          <BulletList items={output.application.weaknesses} />
          {output.application.fact_dependencies.length > 0 && (
            <>
              <Text style={s.subsectionTitle}>Fact Dependencies</Text>
              <BulletList items={output.application.fact_dependencies} />
            </>
          )}
        </Section>

        {/* Counterarguments */}
        <Section num={nextSection()} title="Counterarguments">
          <BulletList items={output.counterarguments} />
        </Section>

        {/* Procedural */}
        <Section num={nextSection()} title="Procedural Considerations">
          <BulletList items={output.procedural_considerations} />
        </Section>

        {/* Missing Facts */}
        {output.missing_facts.length > 0 && (
          <Section num={nextSection()} title="Missing Facts">
            <BulletList items={output.missing_facts} />
          </Section>
        )}

        {/* Research Gaps */}
        {output.research_gaps.length > 0 && (
          <Section num={nextSection()} title="Research Gaps">
            <BulletList items={output.research_gaps} />
          </Section>
        )}

        {/* Next Steps */}
        <Section num={nextSection()} title="Recommended Next Steps">
          <BulletList items={output.recommended_next_steps} />
        </Section>

        {/* Confidence */}
        <Section num={nextSection()} title="Confidence Assessment">
          <Text style={s.confidenceLabel}>
            Overall confidence: {output.confidence.overall}
          </Text>
          <Text style={s.confidenceReason}>{output.confidence.reason}</Text>
          {output.confidence.depends_on.length > 0 && (
            <>
              <Text style={{ ...s.bodySmall, marginTop: 6, fontFamily: "Times-Bold" }}>
                Depends on:
              </Text>
              <BulletList items={output.confidence.depends_on} />
            </>
          )}
        </Section>

        {/* Verification */}
        <Section num={nextSection()} title="Verification Status">
          <View style={s.verificationBox}>
            <Text style={s.body}>
              {output.verification.needs_human_legal_review
                ? "This analysis requires human legal review before reliance."
                : "No mandatory review flags raised by the model."}
            </Text>
            {output.verification.contains_unverified_points && (
              <Text style={{ ...s.bodySmall, color: "#b45309", marginTop: 4 }}>
                Contains {output.verification.unverified_point_count} unverified
                point{output.verification.unverified_point_count !== 1 ? "s" : ""}.
                All authorities should be independently verified.
              </Text>
            )}
            {output.verification.notes?.map((note, i) => (
              <Text key={i} style={{ ...s.bodySmall, marginTop: 2 }}>
                {note}
              </Text>
            ))}
          </View>
        </Section>

        {/* Draft Output */}
        {output.draft_output && (
          <Section num={nextSection()} title={output.draft_output.title || "Draft Output"}>
            <Text style={s.body}>{output.draft_output.body}</Text>
            {output.draft_output.sections?.map((sec, i) => (
              <View key={i} style={{ marginTop: 10 }}>
                <Text style={s.subsectionTitle}>{sec.heading}</Text>
                <Text style={s.body}>{sec.content}</Text>
              </View>
            ))}
          </Section>
        )}

        {/* Disclaimer */}
        <View style={s.disclaimerBlock}>
          <Text style={s.disclaimerText}>{output.disclaimer}</Text>
          <Text style={{ ...s.disclaimerText, marginTop: 6 }}>
            This document was generated by LawOps, an AI-assisted legal analysis tool.
            All authorities, legal propositions, and strategic recommendations require
            independent verification by a qualified legal professional before any reliance.
            This is not legal advice.
          </Text>
        </View>

        {/* Page footer */}
        <View style={s.pageFooter} fixed>
          <Text style={s.footerText}>LawOps · AI-Assisted Draft</Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

// === Sub-components ===

function Section({
  num,
  title,
  children,
}: {
  num: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.sectionWrap} wrap={false}>
      <Text style={s.sectionNumber}>Section {num}</Text>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <Text style={s.bodySmall}>None identified.</Text>;
  }

  return (
    <View>
      {items.map((item, i) => (
        <View key={i} style={s.bulletRow}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function AuthorityCard({ authority }: { authority: Authority }) {
  return (
    <View style={s.card} wrap={false}>
      <View style={s.cardHeader}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={s.cardTitle}>{authority.title}</Text>
          <Text style={s.cardCitation}>{authority.citation}</Text>
        </View>
        <VerificationBadge status={authority.verification_status} />
      </View>
      <View style={{ ...s.tagRow, marginTop: 4 }}>
        {authority.court_or_source && (
          <Text style={s.tag}>{authority.court_or_source}</Text>
        )}
        {authority.year && <Text style={s.tag}>{authority.year}</Text>}
        <Text style={s.tag}>{authority.weight}</Text>
        <Text style={s.tag}>{authority.treatment.replace("_", " ")}</Text>
      </View>
      <Text style={s.cardBody}>{authority.relevance}</Text>
      {authority.quoted_text && (
        <View style={{ marginTop: 4, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: "#d4d4d8" }}>
          <Text style={{ ...s.bodySmall, fontFamily: "Times-Italic" }}>
            &ldquo;{authority.quoted_text}&rdquo;
            {authority.pinpoint && ` at ${authority.pinpoint}`}
          </Text>
        </View>
      )}
    </View>
  );
}

function VerificationBadge({
  status,
}: {
  status: "verified" | "provisional" | "unverified";
}) {
  const badgeStyle =
    status === "verified"
      ? s.badgeVerified
      : status === "provisional"
        ? s.badgeProvisional
        : s.badgeUnverified;

  return <Text style={{ ...s.badge, ...badgeStyle }}>{status}</Text>;
}

// === Export function ===

export async function generateAnalysisPdf(
  output: CopilotOutput,
  stats: OutputStats,
  completedAt: string | null
): Promise<Blob> {
  const doc = (
    <AnalysisPdfDocument
      output={output}
      stats={stats}
      completedAt={completedAt}
    />
  );

  return await pdf(doc).toBlob();
}
