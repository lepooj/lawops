import { requireAdmin, clearAdminSession } from "@/server/lib/admin-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Tab = "all" | "logins" | "activity";

const ACTION_LABELS: Record<string, string> = {
  // Server-side actions
  "matter.create": "Created matter",
  "matter.archive": "Archived matter",
  "matter.restore": "Restored matter",
  "intake.save": "Saved intake section",
  "analysis.start": "Started analysis",
  "analysis.complete": "Analysis completed",
  "document.upload": "Uploaded document",
  "document.delete": "Deleted document",
  "document.update_type": "Changed doc type",
  "document.toggle_include": "Toggled doc inclusion",
  // Client-side interactions
  "page.view": "Viewed page",
  "ui.tab_click": "Clicked tab",
  "ui.filter_change": "Changed filter",
  "ui.matter_open": "Opened matter",
  "ui.dialog_open": "Opened dialog",
  "ui.dialog_close": "Closed dialog",
  "ui.mode_change": "Changed analysis mode",
  "ui.run_analysis_click": "Clicked Run Analysis",
  "ui.toc_click": "Clicked TOC section",
  "ui.export_pdf_click": "Clicked Export PDF",
  "ui.print_click": "Clicked Print",
  "ui.intake_section": "Navigated intake section",
  "ui.upload_start": "Started file upload",
  "ui.drag_drop": "Dropped file",
  "ui.nav_click": "Clicked nav link",
  "ui.sign_out_click": "Clicked sign out",
};

function formatAction(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

function formatMeta(meta: Record<string, unknown> | null): string {
  if (!meta) return "";
  const parts: string[] = [];
  if (meta.path) parts.push(`${meta.path}`);
  if (meta.title) parts.push(`"${meta.title}"`);
  if (meta.filename) parts.push(`${meta.filename}`);
  if (meta.tab) parts.push(`tab: ${meta.tab}`);
  if (meta.section) parts.push(`section: ${meta.section}`);
  if (meta.filter) parts.push(`filter: ${meta.filter}`);
  if (meta.target) parts.push(`→ ${meta.target}`);
  if (meta.dialog) parts.push(`${meta.dialog}`);
  if (meta.mode) parts.push(`mode: ${meta.mode}`);
  if (meta.type) parts.push(`type: ${meta.type}`);
  if (meta.model) parts.push(`model: ${meta.model}`);
  if (meta.fileCount) parts.push(`${meta.fileCount} file(s)`);
  if (meta.inputTokens || meta.outputTokens)
    parts.push(`${meta.inputTokens ?? 0}→${meta.outputTokens ?? 0} tokens`);
  if (meta.latencyMs) parts.push(`${(Number(meta.latencyMs) / 1000).toFixed(1)}s`);
  if (meta.size) parts.push(`${(Number(meta.size) / 1024).toFixed(0)} KB`);
  if (meta.include !== undefined) parts.push(meta.include ? "included" : "excluded");
  if (meta.documentType) parts.push(`→ ${meta.documentType}`);
  return parts.join(" · ");
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tab?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const tab = (params.tab ?? "all") as Tab;
  const pageSize = 50;

  // Fetch data based on tab
  const skip = (page - 1) * pageSize;

  const [loginEntries, loginTotal, activityEntries, activityTotal] = await Promise.all([
    tab !== "activity"
      ? db.loginAudit.findMany({
          orderBy: { createdAt: "desc" },
          take: tab === "all" ? 200 : pageSize,
          ...(tab !== "all" && { skip }),
        })
      : Promise.resolve([]),
    tab !== "activity" ? db.loginAudit.count() : Promise.resolve(0),
    tab !== "logins"
      ? db.activityLog.findMany({
          orderBy: { createdAt: "desc" },
          take: tab === "all" ? 200 : pageSize,
          ...(tab !== "all" && { skip }),
        })
      : Promise.resolve([]),
    tab !== "logins" ? db.activityLog.count() : Promise.resolve(0),
  ]);

  // Normalize into a unified timeline
  type TimelineEntry = {
    id: string;
    type: "login" | "activity";
    time: Date;
    label: string;
    detail: string;
    badge: { text: string; color: string } | null;
    ip: string | null;
    userAgent: string | null;
  };

  const timeline: TimelineEntry[] = [];

  for (const l of loginEntries) {
    timeline.push({
      id: l.id,
      type: "login",
      time: l.createdAt,
      label: l.success ? "Login" : "Login failed",
      detail: l.email + (l.failReason ? ` (${l.failReason})` : ""),
      badge: l.success ? { text: "OK", color: "green" } : { text: "FAIL", color: "red" },
      ip: l.ipAddress,
      userAgent: l.userAgent,
    });
  }

  for (const a of activityEntries) {
    const meta = a.meta as Record<string, unknown> | null;
    timeline.push({
      id: a.id,
      type: "activity",
      time: a.createdAt,
      label: formatAction(a.action),
      detail: formatMeta(meta),
      badge: a.entity
        ? {
            text: a.entity,
            color: a.entity === "analysis" ? "purple" : a.entity === "document" ? "blue" : "zinc",
          }
        : null,
      ip: a.ipAddress,
      userAgent: a.userAgent,
    });
  }

  // Sort merged timeline by time desc
  timeline.sort((a, b) => b.time.getTime() - a.time.getTime());

  // Paginate the merged view
  const total =
    tab === "all" ? loginTotal + activityTotal : tab === "logins" ? loginTotal : activityTotal;
  const displayEntries =
    tab === "all" ? timeline.slice((page - 1) * pageSize, page * pageSize) : timeline;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "All", count: loginTotal + activityTotal },
    { key: "logins", label: "Logins", count: loginTotal },
    { key: "activity", label: "Activity", count: activityTotal },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">Audit Log</h1>
            <p className="mt-1 text-sm text-zinc-500">{total} total entries</p>
          </div>
          <form
            action={async () => {
              "use server";
              await clearAdminSession();
              redirect("/admin/login");
            }}
          >
            <button
              type="submit"
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
            >
              Sign out
            </button>
          </form>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
          {tabs.map((t) => (
            <a
              key={t.key}
              href={`/admin/audit?tab=${t.key}`}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                tab === t.key ? "bg-zinc-700 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-xs text-zinc-500">{t.count}</span>
            </a>
          ))}
        </div>

        {/* Timeline */}
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-800/50 text-xs text-zinc-400 uppercase">
              <tr>
                <th className="w-[160px] px-4 py-3">Time</th>
                <th className="w-[80px] px-4 py-3">Type</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Details</th>
                <th className="w-[130px] px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {displayEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-zinc-800/30">
                  <td className="px-4 py-3 text-xs whitespace-nowrap text-zinc-400">
                    {entry.time.toLocaleString("en-CA", {
                      timeZone: "America/Toronto",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {entry.badge && (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                          entry.badge.color === "green"
                            ? "bg-green-900/30 text-green-400"
                            : entry.badge.color === "red"
                              ? "bg-red-900/30 text-red-400"
                              : entry.badge.color === "purple"
                                ? "bg-purple-900/30 text-purple-400"
                                : entry.badge.color === "blue"
                                  ? "bg-blue-900/30 text-blue-400"
                                  : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {entry.badge.text}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-200">{entry.label}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-zinc-300">{entry.detail}</div>
                  </td>
                  <td className="px-4 py-3" title={entry.userAgent ?? undefined}>
                    <span className="font-mono text-xs text-zinc-400">{entry.ip ?? "—"}</span>
                  </td>
                </tr>
              ))}
              {displayEntries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                    No entries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {page > 1 && (
              <a
                href={`/admin/audit?tab=${tab}&page=${page - 1}`}
                className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              >
                Previous
              </a>
            )}
            <span className="text-sm text-zinc-500">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <a
                href={`/admin/audit?tab=${tab}&page=${page + 1}`}
                className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              >
                Next
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
