"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { CreateMatterDialog } from "@/components/matter/create-matter-dialog";
import { useTrack } from "@/lib/use-track";
import type { MatterStatus, MatterType } from "@prisma/client";

const STATUS_FILTERS = ["ALL", "ACTIVE", "DRAFT", "ARCHIVED"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const MATTER_TYPE_LABELS: Record<MatterType, string> = {
  LITIGATION: "Litigation",
  REGULATORY: "Regulatory",
  ADVISORY: "Advisory",
  OTHER: "Other",
};

const STATUS_BADGE_VARIANT: Record<MatterStatus, "draft" | "active" | "archived"> = {
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
};

interface MatterRow {
  id: string;
  title: string;
  matterType: MatterType;
  status: MatterStatus;
  createdAt: Date;
  updatedAt: Date;
  intake: {
    province: string | null;
    areaOfLaw: string | null;
  } | null;
}

interface MatterListProps {
  matters: MatterRow[];
  activeFilter: string;
}

export function MatterList({ matters, activeFilter }: MatterListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const track = useTrack();

  function setFilter(filter: StatusFilter) {
    track({ action: "ui.filter_change", meta: { filter } });
    const params = new URLSearchParams(searchParams.toString());
    if (filter === "ALL") {
      params.delete("status");
    } else {
      params.set("status", filter);
    }
    router.push(`/dashboard?${params.toString()}`);
  }

  // Find demo matter for quick-open CTA
  const demoMatter = matters.find((m) => m.title.startsWith("Demo —"));

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Matters</h1>
          <p className="mt-1 text-sm text-zinc-500">Your legal analysis workspace</p>
        </div>
        <CreateMatterDialog />
      </div>

      {/* Filter tabs */}
      <div className="mt-5 flex gap-1 border-b border-zinc-800/60">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setFilter(filter)}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? "border-b-2 border-indigo-500 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {filter === "ALL" ? "All" : filter.charAt(0) + filter.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      {matters.length === 0 ? (
        <EmptyState activeFilter={activeFilter} />
      ) : (
        <div className="mt-4">
          {/* Quick-open demo matter CTA */}
          {demoMatter && activeFilter === "ALL" && (
            <Link
              href={`/matters/${demoMatter.id}/analysis`}
              className="mb-4 flex items-center justify-between rounded-lg border border-indigo-900/30 bg-indigo-950/20 px-4 py-3 transition-colors hover:bg-indigo-950/30"
            >
              <div>
                <p className="text-sm font-medium text-indigo-300">Explore a demo analysis</p>
                <p className="text-xs text-indigo-400/60">
                  {demoMatter.title} — see structured output, authorities, and verification
                </p>
              </div>
              <span className="text-xs text-indigo-400">Open →</span>
            </Link>
          )}

          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/60 text-left text-xs font-medium text-zinc-500">
                <th className="pr-4 pb-2">Title</th>
                <th className="pr-4 pb-2">Type</th>
                <th className="pr-4 pb-2">Jurisdiction</th>
                <th className="pr-4 pb-2">Status</th>
                <th className="pb-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {matters.map((matter) => (
                <tr
                  key={matter.id}
                  className="group border-b border-zinc-800/30 transition-colors hover:bg-zinc-800/30"
                >
                  <td className="py-3 pr-4">
                    <Link
                      href={`/matters/${matter.id}/intake`}
                      onClick={() =>
                        track({
                          action: "ui.matter_open",
                          entity: "matter",
                          entityId: matter.id,
                          meta: { title: matter.title },
                        })
                      }
                      className="text-sm font-medium text-zinc-200 group-hover:text-indigo-400"
                    >
                      {matter.title}
                    </Link>
                    {matter.intake?.areaOfLaw && (
                      <p className="mt-0.5 text-xs text-zinc-500">{matter.intake.areaOfLaw}</p>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-sm text-zinc-400">
                    {MATTER_TYPE_LABELS[matter.matterType]}
                  </td>
                  <td className="py-3 pr-4 text-sm text-zinc-400">
                    {matter.intake?.province ?? "—"}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={STATUS_BADGE_VARIANT[matter.status]}>{matter.status}</Badge>
                  </td>
                  <td className="py-3 text-sm text-zinc-500">{formatDate(matter.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EmptyState({ activeFilter }: { activeFilter: string }) {
  if (activeFilter !== "ALL") {
    return (
      <div className="mt-16 flex flex-col items-center text-center">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-8 py-10">
          <p className="text-sm text-zinc-400">No {activeFilter.toLowerCase()} matters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <div className="max-w-md rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-8 py-12">
        <h2 className="text-base font-semibold text-zinc-200">Welcome to LawOps</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Create a matter, enter structured legal context, and generate an AI-assisted analysis with
          cited authorities, risk assessment, and recommended next steps.
        </p>

        {/* Workflow steps */}
        <div className="mt-6 space-y-3 text-left">
          {[
            { step: "1", label: "Create a matter", desc: "Name and classify your legal matter" },
            {
              step: "2",
              label: "Complete intake",
              desc: "Jurisdiction, facts, objective, and known authorities",
            },
            { step: "3", label: "Upload documents", desc: "PDF, DOCX, TXT, or document photos" },
            {
              step: "4",
              label: "Run analysis",
              desc: "Structured AI analysis with verification labels",
            },
          ].map(({ step, label, desc }) => (
            <div key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-medium text-zinc-400">
                {step}
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-300">{label}</p>
                <p className="text-xs text-zinc-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <CreateMatterDialog />
        </div>
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}
