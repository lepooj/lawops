import { notFound } from "next/navigation";
import { getIntake } from "@/server/actions/intake";
import { IntakeForm } from "@/components/intake/intake-form";
import type { IntakeFormData } from "@/components/intake/intake-types";
import type { MatterIntake } from "@prisma/client";

export default async function IntakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const intake = await getIntake(id);

  if (!intake) notFound();

  const formData = mapIntakeToFormData(intake);

  return <IntakeForm matterId={id} initialData={formData} />;
}

/** Map the Prisma MatterIntake record to the form's typed data shape. */
function mapIntakeToFormData(intake: MatterIntake): IntakeFormData {
  return {
    province: intake.province ?? "",
    courtLevel: intake.courtLevel ?? "",
    jurisdictionType: intake.jurisdictionType ?? "",
    areaOfLaw: intake.areaOfLaw ?? "",
    facts: intake.facts ?? "",
    parties: parseJsonArray(intake.parties),
    desiredOutcome: intake.desiredOutcome ?? "",
    constraints: intake.constraints ?? "",
    proceduralStage: intake.proceduralStage ?? "",
    priorDecisions: intake.priorDecisions ?? "",
    keyDates: parseJsonArray(intake.keyDates),
    supportingAuthorities: parseJsonArray(intake.supportingAuthorities),
    opposingArguments: intake.opposingArguments ?? "",
    opposingAuthorities: parseJsonArray(intake.opposingAuthorities),
  };
}

function parseJsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  return [];
}
