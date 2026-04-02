import { requireUser } from "@/server/auth-guard";

export default async function DashboardPage() {
  await requireUser();

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-100">Matters</h1>
        {/* Create matter button — Phase 2 */}
        <button
          disabled
          className="cursor-not-allowed rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white opacity-50"
        >
          + New Matter
        </button>
      </div>

      {/* Empty state */}
      <div className="mt-16 flex flex-col items-center justify-center text-center">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-8 py-12">
          <p className="text-sm text-zinc-400">
            No matters yet. Create your first matter to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
