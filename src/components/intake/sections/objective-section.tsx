"use client";

import type { IntakeFormData } from "../intake-types";

interface Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
}

export function ObjectiveSection({ data, onChange }: Props) {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">
          Legal Objective
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          What outcome are you seeking, and what constraints apply?
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-400">
          Desired Outcome <span className="ml-1 text-amber-500">*</span>
        </label>
        <textarea
          value={data.desiredOutcome}
          onChange={(e) => onChange({ desiredOutcome: e.target.value })}
          placeholder="e.g., Obtain judicial review and quash the decision; seek interim relief to preserve the status quo pending review."
          rows={4}
          className="textarea-base"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-400">
          Constraints <span className="ml-1 text-zinc-600">(optional)</span>
        </label>
        <textarea
          value={data.constraints}
          onChange={(e) => onChange({ constraints: e.target.value })}
          placeholder="e.g., Budget limitations, time sensitivity, relationship considerations, precedent risk tolerance."
          rows={3}
          className="textarea-base"
        />
      </div>
    </div>
  );
}
