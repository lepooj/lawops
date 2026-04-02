"use client";

import { PROVINCES, COURT_LEVELS, AREAS_OF_LAW } from "@/lib/constants";
import type { IntakeFormData } from "../intake-types";

interface Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
}

export function JurisdictionSection({ data, onChange }: Props) {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">
          Jurisdiction & Forum
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Specify the jurisdiction, court level, and area of law.
        </p>
      </div>

      {/* Province / Territory */}
      <Field label="Province / Territory" required>
        <select
          value={data.province}
          onChange={(e) => onChange({ province: e.target.value })}
          className="input-base"
        >
          <option value="">Select province or territory</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Field>

      {/* Jurisdiction Type */}
      <Field label="Jurisdiction Type">
        <div className="flex gap-4">
          {(["provincial", "federal"] as const).map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="radio"
                name="jurisdictionType"
                value={type}
                checked={data.jurisdictionType === type}
                onChange={() => onChange({ jurisdictionType: type })}
                className="accent-indigo-500"
              />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
          ))}
        </div>
      </Field>

      {/* Court Level */}
      <Field label="Court Level">
        <select
          value={data.courtLevel}
          onChange={(e) => onChange({ courtLevel: e.target.value })}
          className="input-base"
        >
          <option value="">Select court level</option>
          {COURT_LEVELS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      {/* Area of Law */}
      <Field label="Area of Law">
        <select
          value={data.areaOfLaw}
          onChange={(e) => onChange({ areaOfLaw: e.target.value })}
          className="input-base"
        >
          <option value="">Select area of law</option>
          {AREAS_OF_LAW.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-zinc-400">
        {label}
        {required && <span className="ml-1 text-amber-500">*</span>}
      </label>
      {children}
    </div>
  );
}
