import { requireUser } from "@/server/auth-guard";
import { listMatters } from "@/server/actions/matters";
import { MatterList } from "./matter-list";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireUser();
  const params = await searchParams;

  const filter =
    params.status === "ACTIVE" || params.status === "DRAFT" || params.status === "ARCHIVED"
      ? params.status
      : "ALL";

  const matters = await listMatters(filter);

  return <MatterList matters={matters} activeFilter={filter} />;
}
