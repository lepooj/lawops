"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTrack } from "@/lib/use-track";
import { saveIntakeSection } from "@/server/actions/intake";
import {
  INTAKE_SECTION_DEFS,
  isIntakeReady,
  sectionHasData,
  extractSectionData,
  type IntakeFormData,
  type IntakeSectionKey,
} from "./intake-types";
import { JurisdictionSection } from "./sections/jurisdiction-section";
import { FactsSection } from "./sections/facts-section";
import { ObjectiveSection } from "./sections/objective-section";
import { HistorySection } from "./sections/history-section";
import { AuthoritiesSection } from "./sections/authorities-section";
import { DocumentsSection } from "./sections/documents-section";

interface IntakeFormProps {
  matterId: string;
  initialData: IntakeFormData;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function IntakeForm({ matterId, initialData }: IntakeFormProps) {
  const track = useTrack();
  const [activeSection, setActiveSection] = useState<IntakeSectionKey>("jurisdiction");
  const [formData, setFormData] = useState<IntakeFormData>(initialData);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  // Refs for debounce and in-flight tracking
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const savedFadeRef = useRef<ReturnType<typeof setTimeout>>(null);
  const saveInFlightRef = useRef(false);
  const pendingSaveRef = useRef<{
    section: IntakeSectionKey;
    data: Record<string, unknown>;
  } | null>(null);

  const ready = isIntakeReady(formData);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (savedFadeRef.current) clearTimeout(savedFadeRef.current);
    };
  }, []);

  const executeSave = useCallback(
    async (section: IntakeSectionKey, data: Record<string, unknown>) => {
      if (section === "documents") return;

      saveInFlightRef.current = true;
      setSaveState("saving");

      const result = await saveIntakeSection({
        matterId,
        section,
        data,
      });

      saveInFlightRef.current = false;

      if ("error" in result) {
        setSaveState("error");
      } else {
        setSaveState("saved");
        if (savedFadeRef.current) clearTimeout(savedFadeRef.current);
        savedFadeRef.current = setTimeout(() => setSaveState("idle"), 2000);
      }

      // If another save was queued while this one was in-flight, fire it now
      if (pendingSaveRef.current) {
        const pending = pendingSaveRef.current;
        pendingSaveRef.current = null;
        executeSave(pending.section, pending.data);
      }
    },
    [matterId],
  );

  const scheduleSave = useCallback(
    (section: IntakeSectionKey, data: Record<string, unknown>) => {
      // Clear any pending debounce
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        if (saveInFlightRef.current) {
          // A save is already running — queue this one to fire after it completes
          pendingSaveRef.current = { section, data };
        } else {
          executeSave(section, data);
        }
      }, 800);
    },
    [executeSave],
  );

  function updateSection(section: IntakeSectionKey, updates: Partial<IntakeFormData>) {
    setFormData((prev) => {
      const next = { ...prev, ...updates };
      const sectionData = extractSectionData(section, next);
      scheduleSave(section, sectionData);
      return next;
    });
  }

  function goToSection(key: IntakeSectionKey) {
    track({
      action: "ui.intake_section",
      entity: "matter",
      entityId: matterId,
      meta: { section: key },
    });
    setActiveSection(key);
  }

  const currentIndex = INTAKE_SECTION_DEFS.findIndex((s) => s.key === activeSection);

  function goNext() {
    if (currentIndex < INTAKE_SECTION_DEFS.length - 1) {
      setActiveSection(INTAKE_SECTION_DEFS[currentIndex + 1].key);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setActiveSection(INTAKE_SECTION_DEFS[currentIndex - 1].key);
    }
  }

  return (
    <div className="flex h-full">
      {/* Left progress rail */}
      <aside className="w-56 shrink-0 border-r border-zinc-800/60 p-4">
        <nav className="space-y-1">
          {INTAKE_SECTION_DEFS.map((section) => {
            const hasData = sectionHasData(section.key, formData);
            const isActive = activeSection === section.key;

            return (
              <button
                key={section.key}
                onClick={() => goToSection(section.key)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                  isActive
                    ? "bg-zinc-800/80 text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-300",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium",
                    {
                      "bg-emerald-500/20 text-emerald-400": hasData && !isActive,
                      "bg-indigo-500/20 text-indigo-400": isActive,
                      "bg-zinc-800 text-zinc-500": !hasData && !isActive,
                    },
                  )}
                >
                  {hasData ? "✓" : section.order}
                </span>
                <span className="truncate">{section.title}</span>
                {section.required && <span className="ml-auto text-[10px] text-zinc-600">req</span>}
              </button>
            );
          })}
        </nav>

        {/* Readiness indicator */}
        <div className="mt-6 rounded-md border border-zinc-800/60 p-3">
          <div className="flex items-center gap-2">
            <span
              className={cn("h-2 w-2 rounded-full", {
                "bg-emerald-500": ready,
                "bg-zinc-600": !ready,
              })}
            />
            <span className="text-xs text-zinc-400">
              {ready ? "Ready for analysis" : "Complete required sections"}
            </span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Section content */}
        <div className="flex-1 overflow-auto px-8 py-6">
          {activeSection === "jurisdiction" && (
            <JurisdictionSection
              data={formData}
              onChange={(updates) => updateSection("jurisdiction", updates)}
            />
          )}
          {activeSection === "facts" && (
            <FactsSection data={formData} onChange={(updates) => updateSection("facts", updates)} />
          )}
          {activeSection === "objective" && (
            <ObjectiveSection
              data={formData}
              onChange={(updates) => updateSection("objective", updates)}
            />
          )}
          {activeSection === "history" && (
            <HistorySection
              data={formData}
              onChange={(updates) => updateSection("history", updates)}
            />
          )}
          {activeSection === "authorities" && (
            <AuthoritiesSection
              data={formData}
              onChange={(updates) => updateSection("authorities", updates)}
            />
          )}
          {activeSection === "documents" && <DocumentsSection matterId={matterId} />}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between border-t border-zinc-800/60 px-8 py-3">
          <div className="text-xs text-zinc-500">
            {saveState === "saving" && "Saving\u2026"}
            {saveState === "saved" && "Saved"}
            {saveState === "error" && <span className="text-red-400">Save failed</span>}
          </div>

          <div className="flex gap-2">
            {currentIndex > 0 && (
              <button
                onClick={goPrev}
                className="rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-200"
              >
                &larr; Previous
              </button>
            )}
            {currentIndex < INTAKE_SECTION_DEFS.length - 1 && (
              <button
                onClick={goNext}
                className="rounded-md bg-zinc-800 px-4 py-1.5 text-sm font-medium text-zinc-200 hover:bg-zinc-700"
              >
                Next &rarr;
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
