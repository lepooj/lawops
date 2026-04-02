/**
 * Plain text extraction — direct buffer read.
 */

import type { ExtractionResult } from "../types";
import { normalizeExtractedText } from "../types";

export async function extractTxt(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const raw = buffer.toString("utf-8");
    const text = normalizeExtractedText(raw);

    if (text === null) {
      return {
        ok: false,
        method: "PLAIN_TEXT",
        error: "File is empty or contains no readable text.",
      };
    }

    return {
      ok: true,
      method: "PLAIN_TEXT",
      text,
      pageCount: null,
      ocrConfidence: null,
    };
  } catch (e) {
    return {
      ok: false,
      method: "PLAIN_TEXT",
      error: e instanceof Error ? e.message : "Text extraction failed",
    };
  }
}
