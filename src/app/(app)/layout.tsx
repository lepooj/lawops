import { requireUser } from "@/server/auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { PageViewTracker } from "@/components/layout/page-view-tracker";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <AppShell user={user}>
      <PageViewTracker />
      {children}
    </AppShell>
  );
}
