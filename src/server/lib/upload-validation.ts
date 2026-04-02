/**
 * Upload validation helpers.
 *
 * Pure functions for file validation — used by the upload route
 * and testable without I/O.
 */

import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  DOCUMENT_TYPES,
} from "@/lib/constants";
import type { DocumentType } from "@prisma/client";

export interface FileValidationInput {
  name: string;
  size: number;
  type: string; // Browser-reported MIME type
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  extension: string;
  sanitizedMime: string;
}

/**
 * Validate a file's metadata (name, size, MIME type) against pilot allowlists.
 */
export function validateFileMetadata(
  file: FileValidationInput
): FileValidationResult {
  const ext = extractExtension(file.name);

  if (!ext) {
    return { valid: false, error: "File has no extension", extension: "", sanitizedMime: file.type };
  }

  if (!isAllowedExtension(ext)) {
    return {
      valid: false,
      error: `File type ${ext} is not supported. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
      extension: ext,
      sanitizedMime: file.type,
    };
  }

  if (!isAllowedMimeType(file.type)) {
    return {
      valid: false,
      error: `MIME type ${file.type} is not supported`,
      extension: ext,
      sanitizedMime: file.type,
    };
  }

  if (!isMimeExtensionConsistent(ext, file.type)) {
    return {
      valid: false,
      error: `File extension ${ext} does not match MIME type ${file.type}`,
      extension: ext,
      sanitizedMime: file.type,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File exceeds ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB limit`,
      extension: ext,
      sanitizedMime: file.type,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty",
      extension: ext,
      sanitizedMime: file.type,
    };
  }

  return { valid: true, extension: ext, sanitizedMime: file.type };
}

/**
 * Check magic bytes in file content for common types.
 * Returns the detected MIME type or null if unrecognized.
 * This is a lightweight check — not a full file-type library.
 */
export function detectMimeFromBytes(
  buffer: Buffer
): string | null {
  if (buffer.length < 4) return null;

  // PDF: starts with %PDF
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return "application/pdf";
  }

  // JPEG: starts with FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG: starts with 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return "image/png";
  }

  // ZIP-based (DOCX, etc.): starts with PK (50 4B)
  if (buffer[0] === 0x50 && buffer[1] === 0x4b) {
    // DOCX is a ZIP — can't distinguish from other ZIP formats with just magic bytes,
    // but if the extension says .docx and magic says ZIP, that's consistent.
    return "application/zip-based";
  }

  // HEIC/HEIF: ftyp box — look for "ftyp" at byte 4
  if (
    buffer.length >= 12 &&
    buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70
  ) {
    return "image/heic";
  }

  return null;
}

/**
 * Cross-check detected magic bytes against the declared MIME type.
 * Returns true if consistent or if magic bytes are unrecognized (permissive for TXT).
 */
export function isMagicByteConsistent(
  declaredMime: string,
  detectedMime: string | null
): boolean {
  // If we can't detect, allow it (covers plain text, unusual formats)
  if (!detectedMime) return true;

  // PDF must match exactly
  if (detectedMime === "application/pdf") return declaredMime === "application/pdf";

  // JPEG
  if (detectedMime === "image/jpeg") return declaredMime === "image/jpeg";

  // PNG
  if (detectedMime === "image/png") return declaredMime === "image/png";

  // HEIC
  if (detectedMime === "image/heic") {
    return declaredMime === "image/heic" || declaredMime === "image/heif";
  }

  // ZIP-based: DOCX is ZIP, so allow it
  if (detectedMime === "application/zip-based") {
    return declaredMime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  return true;
}

/** Parse a document type string, defaulting to OTHER if invalid. */
export function parseDocumentType(type: string): DocumentType {
  if (DOCUMENT_TYPES.includes(type as (typeof DOCUMENT_TYPES)[number])) {
    return type as DocumentType;
  }
  return "OTHER";
}

/** Format file size for display. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// === Internal helpers ===

function extractExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot < 0) return "";
  return filename.slice(lastDot).toLowerCase();
}

function isAllowedExtension(ext: string): boolean {
  return ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number]);
}

function isAllowedMimeType(mime: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mime as (typeof ALLOWED_MIME_TYPES)[number]);
}

/** Check that the extension and MIME type are from the same file type family. */
function isMimeExtensionConsistent(ext: string, mime: string): boolean {
  const EXPECTED: Record<string, string[]> = {
    ".pdf": ["application/pdf"],
    ".docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    ".txt": ["text/plain"],
    ".jpg": ["image/jpeg"],
    ".jpeg": ["image/jpeg"],
    ".png": ["image/png"],
    ".heic": ["image/heic"],
    ".heif": ["image/heif"],
  };

  const allowed = EXPECTED[ext];
  if (!allowed) return false;
  return allowed.includes(mime);
}
