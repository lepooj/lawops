"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createMatter } from "@/server/actions/matters";
import { MATTER_TYPES } from "@/lib/constants";
import { useTrack } from "@/lib/use-track";
import type { MatterType } from "@prisma/client";

const MATTER_TYPE_LABELS: Record<MatterType, string> = {
  LITIGATION: "Litigation",
  REGULATORY: "Regulatory",
  ADVISORY: "Advisory",
  OTHER: "Other",
};

export function CreateMatterDialog() {
  const router = useRouter();
  const track = useTrack();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [matterType, setMatterType] = useState<MatterType>("LITIGATION");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setError("");
    setLoading(true);

    const result = await createMatter({ title: title.trim(), matterType });

    setLoading(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setOpen(false);
    setTitle("");
    setMatterType("LITIGATION");
    router.push(`/matters/${result.id}/intake`);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        track({
          action: v ? "ui.dialog_open" : "ui.dialog_close",
          meta: { dialog: "create_matter" },
        });
      }}
    >
      <DialogTrigger asChild>
        <Button>+ New Matter</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Matter</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="matter-title" className="block text-sm font-medium text-zinc-400">
              Matter Title
            </label>
            <input
              id="matter-title"
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) handleCreate();
              }}
              placeholder="e.g., Singh v. Ontario Ministry"
              className="block w-full rounded-md border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="matter-type" className="block text-sm font-medium text-zinc-400">
              Matter Type
            </label>
            <select
              id="matter-type"
              value={matterType}
              onChange={(e) => setMatterType(e.target.value as MatterType)}
              className="block w-full rounded-md border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              {MATTER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {MATTER_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <DialogClose asChild>
              <Button variant="ghost" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
