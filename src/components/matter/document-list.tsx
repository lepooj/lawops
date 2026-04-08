"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  updateDocumentType,
  toggleIncludeInAnalysis,
  deleteDocument,
  processDocument,
  processAllPending,
} from "@/server/actions/documents";
import {
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  MAX_FILES_PER_MATTER,
  DOCUMENT_TYPES,
} from "@/lib/constants";
import { formatFileSize } from "@/server/lib/upload-validation";
import { useTrack } from "@/lib/use-track";
import type { ExtractionStatus, ExtractionMethod, DocumentType } from "@prisma/client";

// === Types ===

interface DocumentRow {
  id: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  documentType: DocumentType;
  extractionMethod: ExtractionMethod | null;
  extractionStatus: ExtractionStatus;
  extractionError: string | null;
  extractedText: string | null;
  ocrConfidence: number | null;
  pageCount: number | null;
  includeInAnalysis: boolean;
  uploadedAt: Date;
}

interface DocumentListProps {
  matterId: string;
  documents: DocumentRow[];
}

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  PLEADING: "Pleading",
  EVIDENCE: "Evidence",
  CASE_LAW: "Case Law",
  STATUTE: "Statute",
  CORRESPONDENCE: "Correspondence",
  OTHER: "Other",
};

// === Main component ===

export function DocumentList({ matterId, documents }: DocumentListProps) {
  const router = useRouter();
  const track = useTrack();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAll, setProcessingAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const atLimit = documents.length >= MAX_FILES_PER_MATTER;
  const acceptExtensions = ALLOWED_EXTENSIONS.join(",");
  const hasPending = documents.some(
    (d) => d.extractionStatus === "PENDING" || d.extractionStatus === "FAILED",
  );

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    track({
      action: "ui.upload_start",
      entity: "document",
      meta: { matterId, fileCount: files.length },
    });

    setUploadError("");
    setUploading(true);

    const errors: string[] = [];

    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`${file.name}: exceeds ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB limit`);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("matterId", matterId);
      formData.append("documentType", "OTHER");

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          errors.push(`${file.name}: ${body.error || "upload failed"}`);
        }
      } catch {
        errors.push(`${file.name}: network error`);
      }
    }

    setUploading(false);
    if (errors.length > 0) {
      setUploadError(errors.join(" · "));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  async function handleProcess(docId: string) {
    setUploadError("");
    setProcessingId(docId);
    const result = await processDocument(docId, matterId);
    setProcessingId(null);
    if ("error" in result) {
      setUploadError(result.error);
    }
    router.refresh();
  }

  async function handleProcessAll() {
    setUploadError("");
    setProcessingAll(true);
    const result = await processAllPending(matterId);
    setProcessingAll(false);
    if ("error" in result) {
      setUploadError(result.error);
    }
    router.refresh();
  }

  async function handleDelete(docId: string) {
    setDeletingId(docId);
    const result = await deleteDocument(docId, matterId);
    setDeletingId(null);
    if ("error" in result) {
      setUploadError(result.error);
    }
    router.refresh();
  }

  async function handleToggleInclude(docId: string, include: boolean) {
    const result = await toggleIncludeInAnalysis(docId, matterId, include);
    if ("error" in result) {
      setUploadError(result.error);
    }
    router.refresh();
  }

  async function handleTypeChange(docId: string, type: string) {
    const result = await updateDocumentType(docId, matterId, type);
    if ("error" in result) {
      setUploadError(result.error);
    }
    router.refresh();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    track({ action: "ui.drag_drop", entity: "document", meta: { matterId } });
    if (!atLimit) handleUpload(e.dataTransfer.files);
  }

  return (
    <div className="px-8 py-6">
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">Documents</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Upload documents and extract text for analysis.
            </p>
          </div>
          {hasPending && documents.length > 0 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleProcessAll}
              disabled={processingAll || processingId !== null}
            >
              {processingAll ? "Processing…" : "Process All"}
            </Button>
          )}
        </div>

        {/* Upload zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
            atLimit
              ? "border-zinc-800/40 bg-zinc-900/20 opacity-50"
              : "border-zinc-700 bg-zinc-900/40 hover:border-zinc-600"
          }`}
        >
          <p className="text-sm text-zinc-400">
            {atLimit
              ? `Maximum ${MAX_FILES_PER_MATTER} documents reached`
              : "Drop files here or click to upload"}
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            PDF, DOCX, TXT, JPG, PNG, HEIC — up to 25MB each
          </p>
          {!atLimit && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptExtensions}
                multiple
                onChange={(e) => handleUpload(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <Button
                size="sm"
                variant="secondary"
                className="mt-3"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? "Uploading…" : "Choose files"}
              </Button>
            </>
          )}
        </div>

        {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}

        {/* Document list */}
        {documents.length === 0 ? (
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-6 py-10 text-center">
            <p className="text-sm text-zinc-500">
              No documents uploaded yet. Upload files to include them in your analysis.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                deleting={deletingId === doc.id}
                processing={processingId === doc.id}
                onProcess={() => handleProcess(doc.id)}
                onDelete={() => handleDelete(doc.id)}
                onToggleInclude={(include) => handleToggleInclude(doc.id, include)}
                onTypeChange={(type) => handleTypeChange(doc.id, type)}
              />
            ))}
          </div>
        )}

        {documents.length > 0 && (
          <p className="text-xs text-zinc-600">
            {documents.length} of {MAX_FILES_PER_MATTER} documents
          </p>
        )}
      </div>
    </div>
  );
}

// === Document card ===

function DocumentCard({
  doc,
  deleting,
  processing,
  onProcess,
  onDelete,
  onToggleInclude,
  onTypeChange,
}: {
  doc: DocumentRow;
  deleting: boolean;
  processing: boolean;
  onProcess: () => void;
  onDelete: () => void;
  onToggleInclude: (include: boolean) => void;
  onTypeChange: (type: string) => void;
}) {
  const canProcess = doc.extractionStatus === "PENDING" || doc.extractionStatus === "FAILED";

  return (
    <div className="rounded-md border border-zinc-800/60 bg-zinc-900/40 p-4">
      {/* Row 1: filename + controls */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <FileTypeIcon mimeType={doc.mimeType} />
            <p className="truncate text-sm font-medium text-zinc-200">{doc.originalFilename}</p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
            <span>{formatFileSize(doc.fileSize)}</span>
            <span>{formatDate(doc.uploadedAt)}</span>
            <ExtractionStatusBadge doc={doc} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-zinc-500">Include</span>
            <Switch
              checked={doc.includeInAnalysis}
              onCheckedChange={onToggleInclude}
              label="Include in analysis"
            />
          </div>

          <button
            onClick={onDelete}
            disabled={deleting}
            className="text-xs text-zinc-600 hover:text-red-400 disabled:opacity-50"
            aria-label={`Delete ${doc.originalFilename}`}
          >
            {deleting ? "…" : "Delete"}
          </button>
        </div>
      </div>

      {/* Row 2: doc type + process button */}
      <div className="mt-3 flex items-center justify-between">
        <select
          value={doc.documentType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="rounded-md border border-zinc-800 bg-zinc-800/60 px-2 py-1 text-xs text-zinc-300 focus:border-indigo-500 focus:outline-none"
        >
          {DOCUMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {DOC_TYPE_LABELS[type as DocumentType] ?? type}
            </option>
          ))}
        </select>

        {canProcess && (
          <button
            onClick={onProcess}
            disabled={processing}
            className="rounded-md bg-indigo-600/80 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
          >
            {processing
              ? "Processing…"
              : doc.extractionStatus === "FAILED"
                ? "Retry"
                : "Extract Text"}
          </button>
        )}
      </div>

      {/* Row 3: Extraction detail — error or text preview */}
      {doc.extractionStatus === "FAILED" && doc.extractionError && (
        <div className="mt-3 rounded border border-red-900/40 bg-red-950/20 px-3 py-2">
          <p className="text-xs text-red-400">{doc.extractionError}</p>
        </div>
      )}

      {doc.extractionStatus === "COMPLETE" && doc.extractedText && (
        <div className="mt-3 rounded border border-zinc-800/60 bg-zinc-950/40 px-3 py-2">
          {doc.extractionMethod === "OCR" && (
            <p className="mb-1 text-[10px] font-medium text-amber-500">
              OCR extracted — may contain errors
            </p>
          )}
          <p className="line-clamp-3 text-xs text-zinc-500">
            {doc.extractedText.slice(0, 300)}
            {doc.extractedText.length > 300 && "…"}
          </p>
        </div>
      )}

      {doc.extractionStatus === "COMPLETE" &&
        doc.extractionMethod === "OCR" &&
        !doc.extractedText && (
          <div className="mt-3 rounded border border-amber-900/40 bg-amber-950/20 px-3 py-2">
            <p className="text-xs text-amber-400">No text detected in this image.</p>
          </div>
        )}
    </div>
  );
}

// === Helpers ===

function FileTypeIcon({ mimeType }: { mimeType: string }) {
  const isImage = mimeType.startsWith("image/");
  const isPdf = mimeType === "application/pdf";

  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold ${
        isImage
          ? "bg-violet-500/20 text-violet-400"
          : isPdf
            ? "bg-red-500/20 text-red-400"
            : "bg-blue-500/20 text-blue-400"
      }`}
    >
      {isImage ? "IMG" : isPdf ? "PDF" : "DOC"}
    </span>
  );
}

function ExtractionStatusBadge({ doc }: { doc: DocumentRow }) {
  switch (doc.extractionStatus) {
    case "PENDING":
      return <Badge variant="draft">Pending</Badge>;
    case "PROCESSING":
      return <Badge variant="draft">Processing…</Badge>;
    case "COMPLETE":
      if (doc.extractionMethod === "OCR") {
        const confidence = doc.ocrConfidence ?? 0;
        if (confidence >= 0.7) {
          return <Badge variant="active">OCR ({Math.round(confidence * 100)}%)</Badge>;
        }
        return <Badge variant="draft">OCR — low ({Math.round(confidence * 100)}%)</Badge>;
      }
      return (
        <Badge variant="active">Extracted{doc.pageCount ? ` (${doc.pageCount} pg)` : ""}</Badge>
      );
    case "FAILED":
      return <span className="text-xs text-red-400">Failed</span>;
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}
