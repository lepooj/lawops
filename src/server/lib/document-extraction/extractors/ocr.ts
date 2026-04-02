/**
 * OCR text extraction using tesseract.js.
 *
 * Used for JPG, PNG, and HEIC (after conversion) images.
 * Confidence is stored as 0.0-1.0 from Tesseract's mean word confidence.
 */

import { createWorker } from "tesseract.js";
import type { ExtractionResult } from "../types";
import { normalizeExtractedText } from "../types";
import { isHeicMimeType } from "../types";
import { convertHeicToJpeg } from "./heic";

const OCR_TIMEOUT_MS = 60_000; // 60 seconds

/**
 * Run OCR on an image buffer. Handles HEIC conversion if needed.
 */
export async function extractOcr(
  buffer: Buffer,
  mimeType: string
): Promise<ExtractionResult> {
  try {
    // Convert HEIC to JPEG first
    let imageBuffer = buffer;
    if (isHeicMimeType(mimeType)) {
      try {
        imageBuffer = await convertHeicToJpeg(buffer);
      } catch (e) {
        return {
          ok: false,
          method: "OCR",
          error:
            "Failed to convert HEIC image for OCR processing. " +
            (e instanceof Error ? e.message : "Try converting to JPEG before uploading."),
        };
      }
    }

    // Run OCR with timeout
    const result = await Promise.race([
      runTesseract(imageBuffer),
      timeout(OCR_TIMEOUT_MS),
    ]);

    if (result === null) {
      return {
        ok: false,
        method: "OCR",
        error: `OCR processing timed out after ${OCR_TIMEOUT_MS / 1000} seconds.`,
      };
    }

    const text = normalizeExtractedText(result.text);
    // Tesseract confidence is 0-100, normalize to 0.0-1.0
    const confidence = Math.round(result.confidence) / 100;

    if (text === null) {
      return {
        ok: true, // OCR completed but found nothing — still a valid result
        method: "OCR",
        text: "",
        pageCount: null,
        ocrConfidence: confidence,
      };
    }

    return {
      ok: true,
      method: "OCR",
      text,
      pageCount: null,
      ocrConfidence: confidence,
    };
  } catch (e) {
    return {
      ok: false,
      method: "OCR",
      error: e instanceof Error ? e.message : "OCR extraction failed",
    };
  }
}

async function runTesseract(
  buffer: Buffer
): Promise<{ text: string; confidence: number }> {
  const worker = await createWorker("eng");
  try {
    const {
      data: { text, confidence },
    } = await worker.recognize(buffer);
    return { text, confidence };
  } finally {
    await worker.terminate();
  }
}

function timeout(ms: number): Promise<null> {
  return new Promise((resolve) => setTimeout(() => resolve(null), ms));
}
