"use client";

import { useState } from "react";
import type { IntakeFormData, AuthorityEntry } from "../intake-types";

interface Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
}

export function AuthoritiesSection({ data, onChange }: Props) {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">
          Known Authorities
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Add any precedents or authorities you want the analysis to consider.
          These will be labeled as user-provided in the output.
        </p>
      </div>

      {/* Supporting Authorities */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-zinc-400">
          Supporting Authorities
        </label>
        <AuthorityList
          authorities={data.supportingAuthorities}
          onChange={(supportingAuthorities) =>
            onChange({ supportingAuthorities })
          }
          placeholder="Add cases, statutes, or other authorities that support your position"
        />
      </div>

      {/* Opposing Arguments */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-400">
          Known Opposing Arguments
        </label>
        <textarea
          value={data.opposingArguments}
          onChange={(e) => onChange({ opposingArguments: e.target.value })}
          placeholder="Describe the arguments you expect the opposing side to raise."
          rows={4}
          className="textarea-base"
        />
      </div>

      {/* Opposing Authorities */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-zinc-400">
          Opposing Authorities
        </label>
        <AuthorityList
          authorities={data.opposingAuthorities}
          onChange={(opposingAuthorities) => onChange({ opposingAuthorities })}
          placeholder="Add authorities you expect the other side to rely on"
        />
      </div>
    </div>
  );
}

function AuthorityList({
  authorities,
  onChange,
  placeholder,
}: {
  authorities: AuthorityEntry[];
  onChange: (entries: AuthorityEntry[]) => void;
  placeholder: string;
}) {
  const [caseName, setCaseName] = useState("");
  const [citation, setCitation] = useState("");
  const [relevance, setRelevance] = useState("");

  function addAuthority() {
    if (!caseName.trim() || !citation.trim()) return;
    onChange([
      ...authorities,
      {
        caseName: caseName.trim(),
        citation: citation.trim(),
        relevance: relevance.trim(),
      },
    ]);
    setCaseName("");
    setCitation("");
    setRelevance("");
  }

  function removeAuthority(index: number) {
    onChange(authorities.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      {authorities.length === 0 && (
        <p className="text-xs text-zinc-600">{placeholder}</p>
      )}

      {authorities.map((auth, i) => (
        <div
          key={i}
          className="rounded-md border border-zinc-800/60 bg-zinc-900/40 px-3 py-2"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-200">
                {auth.caseName}
              </p>
              <p className="text-xs text-zinc-400">{auth.citation}</p>
              {auth.relevance && (
                <p className="mt-1 text-xs text-zinc-500">{auth.relevance}</p>
              )}
            </div>
            <button
              onClick={() => removeAuthority(i)}
              className="shrink-0 text-xs text-zinc-600 hover:text-red-400"
              aria-label={`Remove ${auth.caseName}`}
            >
              ×
            </button>
          </div>
        </div>
      ))}

      <div className="space-y-2 rounded-md border border-dashed border-zinc-800 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={caseName}
            onChange={(e) => setCaseName(e.target.value)}
            placeholder="Case name / title"
            className="input-base flex-1"
          />
          <input
            type="text"
            value={citation}
            onChange={(e) => setCitation(e.target.value)}
            placeholder="Citation (e.g., 2021 SCC 1)"
            className="input-base flex-1"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={relevance}
            onChange={(e) => setRelevance(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAuthority();
              }
            }}
            placeholder="Why is this authority relevant? (optional)"
            className="input-base flex-1"
          />
          <button
            onClick={addAuthority}
            disabled={!caseName.trim() || !citation.trim()}
            className="rounded-md bg-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
