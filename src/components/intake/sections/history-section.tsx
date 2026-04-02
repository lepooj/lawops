"use client";

import { useState } from "react";
import type { IntakeFormData, KeyDate } from "../intake-types";

interface Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
}

const PROCEDURAL_STAGES = [
  "Pre-litigation",
  "Pleadings",
  "Discovery",
  "Pre-trial / Case Conference",
  "Trial",
  "Post-trial / Costs",
  "Appeal",
  "Judicial Review Application",
  "Tribunal Hearing",
  "Settlement / Negotiation",
  "Enforcement / Execution",
  "Other",
] as const;

export function HistorySection({ data, onChange }: Props) {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">
          Procedural History
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Where does this matter currently stand procedurally?
        </p>
      </div>

      {/* Procedural Stage */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-400">
          Current Procedural Stage
        </label>
        <select
          value={data.proceduralStage}
          onChange={(e) => onChange({ proceduralStage: e.target.value })}
          className="input-base"
        >
          <option value="">Select stage</option>
          {PROCEDURAL_STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Prior Decisions */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-400">
          Prior Decisions / Orders
        </label>
        <textarea
          value={data.priorDecisions}
          onChange={(e) => onChange({ priorDecisions: e.target.value })}
          placeholder="Describe any prior decisions, orders, or rulings relevant to this matter."
          rows={4}
          className="textarea-base"
        />
      </div>

      {/* Key Dates */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-zinc-400">
          Key Dates
        </label>
        <KeyDateList
          dates={data.keyDates}
          onChange={(keyDates) => onChange({ keyDates })}
        />
      </div>
    </div>
  );
}

function KeyDateList({
  dates,
  onChange,
}: {
  dates: KeyDate[];
  onChange: (dates: KeyDate[]) => void;
}) {
  const [newDate, setNewDate] = useState("");
  const [newEvent, setNewEvent] = useState("");

  function addDate() {
    if (!newDate.trim() || !newEvent.trim()) return;
    onChange([...dates, { date: newDate.trim(), event: newEvent.trim() }]);
    setNewDate("");
    setNewEvent("");
  }

  function removeDate(index: number) {
    onChange(dates.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      {dates.map((d, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-md border border-zinc-800/60 bg-zinc-900/40 px-3 py-2"
        >
          <span className="w-28 shrink-0 text-sm font-medium text-zinc-300">
            {d.date}
          </span>
          <span className="flex-1 text-sm text-zinc-400">{d.event}</span>
          <button
            onClick={() => removeDate(i)}
            className="text-xs text-zinc-600 hover:text-red-400"
            aria-label="Remove date"
          >
            ×
          </button>
        </div>
      ))}

      <div className="flex gap-2">
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="input-base w-40"
        />
        <input
          type="text"
          value={newEvent}
          onChange={(e) => setNewEvent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addDate();
            }
          }}
          placeholder="What happened"
          className="input-base flex-1"
        />
        <button
          onClick={addDate}
          disabled={!newDate.trim() || !newEvent.trim()}
          className="rounded-md bg-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}
