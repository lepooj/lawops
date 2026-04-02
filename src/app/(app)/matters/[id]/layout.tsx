import { notFound } from "next/navigation";
import { getMatter } from "@/server/actions/matters";
import { MatterWorkspaceShell } from "@/components/matter/matter-workspace-shell";
import { isIntakeReady } from "@/components/intake/intake-types";

export default async function MatterLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const { id } = await params;
  const matter = await getMatter(id);

  if (!matter) notFound();

  return (
    <MatterWorkspaceShell
      matterId={matter.id}
      title={matter.title}
      status={matter.status}
      intakeReady={isIntakeReady({
        province: matter.intake?.province,
        facts: matter.intake?.facts,
        desiredOutcome: matter.intake?.desiredOutcome,
      })}
    >
      {children}
    </MatterWorkspaceShell>
  );
}
