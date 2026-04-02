import { getLatestAnalysis } from "@/server/actions/analysis";
import { getMatter } from "@/server/actions/matters";
import { AnalysisPageClient } from "./analysis-page-client";

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [latestRun, matter] = await Promise.all([
    getLatestAnalysis(id),
    getMatter(id),
  ]);

  return (
    <AnalysisPageClient
      matterId={id}
      latestRun={latestRun}
      matterTitle={matter?.title}
    />
  );
}
