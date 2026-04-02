import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Demo user
  const passwordHash = await hash("pilot2026!", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@lawops.ca" },
    update: {},
    create: {
      email: "demo@lawops.ca",
      name: "Demo User",
      passwordHash,
    },
  });

  console.log(`Seeded user: ${user.email} (id: ${user.id})`); // eslint-disable-line no-console

  // === Matter 1: Judicial Review (ACTIVE, with analysis) ===

  const matter1 = await prisma.matter.upsert({
    where: { id: "demo-matter-jrev-001" },
    update: {},
    create: {
      id: "demo-matter-jrev-001",
      userId: user.id,
      title: "Demo — Judicial Review of Licensing Decision",
      matterType: "LITIGATION",
      status: "ACTIVE",
    },
  });

  await prisma.matterIntake.upsert({
    where: { matterId: matter1.id },
    update: {},
    create: {
      matterId: matter1.id,
      province: "Ontario",
      courtLevel: "Superior Court",
      jurisdictionType: "provincial",
      areaOfLaw: "Administrative Law",
      facts:
        "The applicant operated a licensed food preparation business for 12 years. " +
        "On January 15, 2026, the Municipal Licensing Commission suspended the licence " +
        "without prior written notice, citing a single inspection report from December 2025. " +
        "The applicant was not given an opportunity to respond before the suspension took effect. " +
        "The inspection report identified three minor deficiencies, all of which were corrected " +
        "within 48 hours of the inspection. No prior compliance history issues exist on record. " +
        "The suspension has caused immediate loss of business revenue estimated at $15,000/month.",
      parties: [
        { name: "ABC Food Services Ltd.", role: "Applicant" },
        { name: "Municipal Licensing Commission", role: "Respondent" },
      ],
      desiredOutcome:
        "Obtain judicial review of the suspension decision. Seek interim relief " +
        "to reinstate the licence pending full hearing. Establish that the decision " +
        "was procedurally unfair and unreasonable.",
      constraints:
        "Time-sensitive — ongoing business loss. Budget for litigation is limited. " +
        "Prefer resolution without full trial if possible.",
      proceduralStage: "Pre-litigation",
      priorDecisions: "No prior decisions. This is the first challenge.",
      keyDates: [
        { date: "2025-12-10", event: "Inspection conducted" },
        { date: "2025-12-12", event: "Deficiencies corrected" },
        { date: "2026-01-15", event: "Licence suspended without notice" },
        { date: "2026-02-15", event: "Internal review deadline (not yet filed)" },
      ],
      supportingAuthorities: [
        {
          caseName: "Baker v. Canada (Minister of Citizenship and Immigration)",
          citation: "1999 CanLII 699 (SCC), [1999] 2 SCR 817",
          relevance:
            "Establishes duty of procedural fairness in administrative decisions, " +
            "including the right to be heard before adverse action.",
        },
      ],
      opposingArguments:
        "The Commission may argue that the statutory scheme permits immediate suspension " +
        "where public safety is at risk, and that the internal review process satisfies " +
        "the duty of fairness.",
      opposingAuthorities: [
        {
          caseName: "Canada (Minister of Citizenship and Immigration) v. Vavilov",
          citation: "2019 SCC 65",
          relevance:
            "May be cited by respondent to argue for deference to the Commission's " +
            "expertise in licensing matters under reasonableness review.",
        },
      ],
    },
  });

  // Seed a completed analysis run for matter 1
  await prisma.analysisRun.upsert({
    where: { matterId_runNumber: { matterId: matter1.id, runNumber: 1 } },
    update: {},
    create: {
      matterId: matter1.id,
      userId: user.id,
      runNumber: 1,
      status: "COMPLETE",
      inputSnapshot: { province: "Ontario", areaOfLaw: "Administrative Law" },
      documentExcerpts: [],
      rawOutput: JSON.stringify(DEMO_ANALYSIS_OUTPUT),
      promptVersion: "v1",
      model: "demo-seed",
      inputTokens: 2400,
      outputTokens: 4800,
      latencyMs: 42000,
      completedAt: new Date("2026-03-28T14:32:00Z"),
    },
  });

  console.log(`Seeded matter: ${matter1.title}`); // eslint-disable-line no-console

  // === Matter 2: Employment Dispute (DRAFT, no analysis yet) ===

  const matter2 = await prisma.matter.upsert({
    where: { id: "demo-matter-empl-002" },
    update: {},
    create: {
      id: "demo-matter-empl-002",
      userId: user.id,
      title: "Demo — Wrongful Dismissal Claim",
      matterType: "LITIGATION",
      status: "DRAFT",
    },
  });

  await prisma.matterIntake.upsert({
    where: { matterId: matter2.id },
    update: {},
    create: {
      matterId: matter2.id,
      province: "British Columbia",
      courtLevel: "Supreme Court of Canada",
      jurisdictionType: "provincial",
      areaOfLaw: "Employment Law",
      facts:
        "The employee was terminated after 8 years of service. " +
        "The employer alleges just cause based on a single incident of alleged policy violation. " +
        "The employee denies the allegations and contends the termination was without cause.",
      parties: [
        { name: "J. Thompson", role: "Plaintiff" },
        { name: "TechCorp BC Ltd.", role: "Defendant" },
      ],
      desiredOutcome:
        "Obtain damages for wrongful dismissal including reasonable notice, " +
        "aggravated damages for bad faith manner of dismissal, and costs.",
    },
  });

  console.log(`Seeded matter: ${matter2.title}`); // eslint-disable-line no-console
}

// === Demo analysis output (valid against CopilotOutput schema) ===

const DEMO_ANALYSIS_OUTPUT = {
  mode: "memo",
  matter_summary: {
    task: "Analyze viability of judicial review of municipal licensing suspension",
    jurisdiction: "Ontario",
    forum: "Ontario Superior Court of Justice",
    procedural_posture: "Pre-litigation — considering judicial review application",
    area_of_law: ["Administrative Law"],
    requested_outcome:
      "Judicial review of suspension, interim relief, reinstatement of licence",
    summary:
      "This matter involves a challenge to a municipal licensing decision where the applicant's " +
      "food preparation licence was suspended without prior notice or opportunity to respond. " +
      "The core issues are procedural fairness and the reasonableness of the decision.",
  },
  issues: [
    {
      id: "I1",
      issue:
        "Whether the suspension decision was procedurally unfair due to lack of prior notice and opportunity to respond",
      importance: "high",
      status: "live",
    },
    {
      id: "I2",
      issue:
        "Whether the suspension was unreasonable given the minor nature of the deficiencies and the applicant's compliance history",
      importance: "high",
      status: "live",
    },
    {
      id: "I3",
      issue:
        "Whether internal review must be exhausted before seeking judicial review",
      importance: "medium",
      status: "research_needed",
    },
    {
      id: "I4",
      issue:
        "Whether interim relief (stay of suspension) is available pending judicial review",
      importance: "high",
      status: "fact_dependent",
    },
  ],
  governing_law: [
    {
      topic: "Standard of Review",
      rule_statement:
        "Following Vavilov, administrative decisions are presumptively reviewed on a reasonableness standard. " +
        "Procedural fairness issues are reviewed on a correctness standard.",
      source_type: "case",
      verification_status: "verified",
      authority_ids: ["A1"],
    },
    {
      topic: "Duty of Procedural Fairness",
      rule_statement:
        "Administrative decision-makers owe a duty of procedural fairness. The content of the duty varies " +
        "with the nature of the decision and its impact on the affected party. Baker factors apply.",
      source_type: "case",
      verification_status: "verified",
      authority_ids: ["A2"],
    },
    {
      topic: "Exhaustion of Internal Remedies",
      rule_statement:
        "Courts may require exhaustion of internal review processes before granting judicial review, " +
        "but exceptions exist where the internal process would be inadequate or cause irreparable harm.",
      source_type: "general_reasoning",
      verification_status: "provisional",
    },
  ],
  authorities: [
    {
      id: "A1",
      title:
        "Canada (Minister of Citizenship and Immigration) v. Vavilov",
      type: "case",
      citation: "2019 SCC 65",
      jurisdiction: "Canada",
      court_or_source: "Supreme Court of Canada",
      year: 2019,
      weight: "binding",
      relevance:
        "Establishes the modern framework for judicial review of administrative decisions. " +
        "Reasonableness is the presumptive standard. Procedural fairness is reviewed for correctness.",
      treatment: "supports",
      verification_status: "verified",
    },
    {
      id: "A2",
      title:
        "Baker v. Canada (Minister of Citizenship and Immigration)",
      type: "case",
      citation: "[1999] 2 SCR 817",
      jurisdiction: "Canada",
      court_or_source: "Supreme Court of Canada",
      year: 1999,
      weight: "binding",
      relevance:
        "Provides the factors for determining the content of procedural fairness, " +
        "including the nature of the decision, the statutory scheme, the importance to the individual, " +
        "legitimate expectations, and the decision-maker's procedural choices.",
      treatment: "supports",
      verification_status: "verified",
    },
    {
      id: "A3",
      title: "Municipal licensing statute provisions",
      type: "statute",
      citation: "Licensing Act provisions (specific citation to be confirmed)",
      jurisdiction: "Ontario",
      year: null,
      weight: "binding",
      relevance:
        "The enabling statute governs the Commission's powers including suspension authority. " +
        "The specific provisions need to be reviewed to determine whether immediate suspension without " +
        "notice is authorized and under what circumstances.",
      treatment: "background_only",
      verification_status: "unverified",
    },
  ],
  application: {
    core_analysis: [
      "The suspension without prior notice or opportunity to respond raises a strong procedural fairness argument. " +
        "Under Baker, the applicant was entitled to some form of notice and hearing before an adverse licensing decision.",
      "The proportionality of the suspension is questionable — three minor deficiencies corrected within 48 hours, " +
        "with no prior compliance issues, appears disproportionate to a full licence suspension.",
      "The standard of review for the substantive decision is reasonableness (Vavilov). " +
        "The procedural fairness challenge is reviewed for correctness.",
    ],
    strongest_arguments: [
      "Complete denial of procedural fairness: no notice, no opportunity to respond before suspension — a fundamental breach.",
      "Disproportionate response: minor deficiencies already corrected, no history of non-compliance, " +
        "yet the most severe sanction (suspension) was imposed.",
      "Irreparable harm from ongoing business losses supports interim relief.",
    ],
    weaknesses: [
      "If the enabling statute authorizes immediate suspension for public safety concerns, " +
        "the procedural fairness argument may be weakened.",
      "The Commission may argue that the internal review process provides adequate procedural protection.",
      "Without reviewing the actual statutory provisions, the strength of the statutory authority argument is uncertain.",
    ],
    fact_dependencies: [
      "The text of the enabling statute and its suspension provisions must be reviewed.",
      "Whether the inspection report characterizes the deficiencies as public safety risks.",
      "The exact terms and timeline of the internal review process.",
      "Financial evidence to support the irreparable harm claim for interim relief.",
    ],
  },
  counterarguments: [
    "The Commission may argue public safety justifies immediate suspension without notice.",
    "The internal review process may be argued to satisfy the duty of fairness, " +
      "making pre-suspension notice unnecessary.",
    "Deference to the Commission's expertise under Vavilov reasonableness review.",
  ],
  procedural_considerations: [
    "Consider whether to file for internal review concurrently with judicial review application to preserve all avenues.",
    "An urgent motion for interim relief (stay of suspension) should be considered immediately given ongoing financial harm.",
    "Ensure the application is filed within the limitation period for judicial review.",
    "Gather affidavit evidence on financial harm, compliance history, and the corrective actions taken.",
  ],
  missing_facts: [
    "Full text of the enabling statute and relevant regulations.",
    "Complete inspection report and any correspondence from the Commission.",
    "Internal review process rules, timelines, and scope.",
    "Detailed financial records to quantify business losses.",
  ],
  research_gaps: [
    "Whether the specific enabling statute provides for immediate suspension without notice — this changes the procedural fairness analysis significantly.",
    "Recent Ontario case law on licensing suspensions and the exhaustion doctrine in this specific regulatory context.",
    "Whether there are Ontario-specific procedural rules for judicial review of municipal licensing decisions.",
  ],
  recommended_next_steps: [
    "Obtain and review the full text of the enabling statute and licensing regulations.",
    "Request the complete inspection report and all Commission correspondence.",
    "Prepare an urgent motion for interim relief with supporting affidavit on financial harm.",
    "Research the internal review process to determine whether concurrent pursuit is strategic.",
    "Draft the judicial review application with detailed grounds focusing on procedural fairness and reasonableness.",
  ],
  draft_output: null,
  comparison_matrix: null,
  confidence: {
    overall: "moderate",
    reason:
      "The procedural fairness argument is strong on available facts. However, the analysis " +
      "is limited by the absence of the enabling statute text, which could significantly affect " +
      "the viability of both the procedural and substantive challenges.",
    depends_on: [
      "Text of the enabling statute regarding suspension authority",
      "Whether the statute permits immediate suspension without notice",
      "Details of the internal review process",
    ],
    rough_strength_assessment: "moderate",
  },
  verification: {
    used_only_provided_and_retrieved_sources: true,
    contains_unverified_points: true,
    unverified_point_count: 1,
    needs_human_legal_review: true,
    notes: [
      "The enabling statute has not been reviewed — statutory authority for immediate suspension is unverified.",
      "Municipal licensing statute citation needs confirmation.",
    ],
  },
  disclaimer:
    "This analysis is AI-generated and intended as a starting point for legal research. " +
    "All authorities, legal propositions, and strategic recommendations require independent " +
    "verification by a qualified legal professional before reliance. This is not legal advice.",
};

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
