import { getLatestAnalysis } from "@/server/actions/analysis";
import { AnalysisPageClient } from "./analysis-page-client";

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const latestRun = await getLatestAnalysis(id);

  return <AnalysisPageClient matterId={id} latestRun={latestRun} />;
}
