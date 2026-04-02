/**
 * Types for the document extraction pipeline.
 */

import type { ExtractionMethod } from "@prisma/client";

/** Result of a successful extraction. */
export interface ExtractionSuccess {
  ok: true;
  method: ExtractionMethod;
  text: string;
  pageCount: number | null;
  /** OCR confidence 0.0-1.0, only populated for OCR extractions. */
  ocrConfidence: number | null;
}

/** Result of a failed extraction. */
export interface ExtractionFailure {
  ok: false;
  method: ExtractionMethod;
  error: string;
}

export type ExtractionResult = ExtractionSuccess | ExtractionFailure;

/** Minimum text length to consider extraction non-empty. */
export const MIN_MEANINGFUL_TEXT_LENGTH = 5;

/**
 * Normalize extracted text: trim whitespace, treat near-empty as empty.
 * Returns null if the text has no meaningful content.
 */
export function normalizeExtractedText(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length < MIN_MEANINGFUL_TEXT_LENGTH) return null;
  return trimmed;
}

/**
 * Determine if a MIME type should use OCR extraction.
 */
export function isOcrMimeType(mimeType: string): boolean {
  return (
    mimeType === "image/jpeg" ||
    mimeType === "image/png" ||
    mimeType === "image/heic" ||
    mimeType === "image/heif"
  );
}

/**
 * Determine if a MIME type requires HEIC-to-JPEG conversion before OCR.
 */
export function isHeicMimeType(mimeType: string): boolean {
  return mimeType === "image/heic" || mimeType === "image/heif";
}
