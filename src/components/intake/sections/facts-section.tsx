"use client";

import { useState } from "react";
import type { IntakeFormData, Party } from "../intake-types";
import { MAX_FACT_NARRATIVE_LENGTH } from "@/lib/constants";

interface Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
}

const PARTY_ROLES = [
  "Plaintiff",
  "Defendant",
  "Applicant",
  "Respondent",
  "Appellant",
  "Intervenor",
  "Third Party",
  "Crown",
  "Other",
] as const;

export function FactsSection({ data, onChange }: Props) {
  // Plain textarea for facts — Tiptap can be swapped in later without changing the data model.
  // The schema stores HTML-compatible text, but plain text works fine for pilot.
  const plainFacts = data.facts.replace(/<[^>]*>/g, "");
  const charCount = plainFacts.length;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">
          Facts & Parties
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Describe the relevant facts and identify the parties involved.
        </p>
      </div>

      {/* Fact narrative */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-400">
          Fact Narrative <span className="ml-1 text-amber-500">*</span>
        </label>
        <textarea
          value={data.facts}
          onChange={(e) => onChange({ facts: e.target.value })}
          placeholder="Describe the key facts of the matter. Include relevant dates, events, and circumstances."
          rows={8}
          maxLength={MAX_FACT_NARRATIVE_LENGTH}
          className="textarea-base"
        />
        <p className="text-right text-[11px] text-zinc-600">
          {charCount.toLocaleString()} / {MAX_FACT_NARRATIVE_LENGTH.toLocaleString()}
        </p>
      </div>

      {/* Parties */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-zinc-400">
          Parties
        </label>
        <PartyList
          parties={data.parties}
          onChange={(parties) => onChange({ parties })}
        />
      </div>
    </div>
  );
}

function PartyList({
  parties,
  onChange,
}: {
  parties: Party[];
  onChange: (parties: Party[]) => void;
}) {
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<string>(PARTY_ROLES[0]);

  function addParty() {
    if (!newName.trim()) return;
    onChange([...parties, { name: newName.trim(), role: newRole }]);
    setNewName("");
  }

  function removeParty(index: number) {
    onChange(parties.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      {parties.map((party, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-md border border-zinc-800/60 bg-zinc-900/40 px-3 py-2"
        >
          <span className="flex-1 text-sm text-zinc-200">{party.name}</span>
          <span className="text-xs text-zinc-500">{party.role}</span>
          <button
            onClick={() => removeParty(i)}
            className="text-xs text-zinc-600 hover:text-red-400"
            aria-label={`Remove ${party.name}`}
          >
            ×
          </button>
        </div>
      ))}

      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addParty();
            }
          }}
          placeholder="Party name"
          className="input-base flex-1"
        />
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          className="input-base w-36"
        >
          {PARTY_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button
          onClick={addParty}
          disabled={!newName.trim()}
          className="rounded-md bg-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}
