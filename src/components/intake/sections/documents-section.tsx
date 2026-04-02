"use client";

import Link from "next/link";

interface Props {
  matterId: string;
}

export function DocumentsSection({ matterId }: Props) {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">Documents</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Upload and manage documents for this matter in the Documents tab.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-6 py-8 text-center">
        <p className="text-sm text-zinc-400">
          Document upload and text extraction are managed separately.
        </p>
        <Link
          href={`/matters/${matterId}/documents`}
          className="mt-3 inline-block rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700"
        >
          Go to Documents →
        </Link>
      </div>
    </div>
  );
}
