/**
 * DOCX text extraction using mammoth.
 */

import mammoth from "mammoth";
import type { ExtractionResult } from "../types";
import { normalizeExtractedText } from "../types";

export async function extractDocx(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = normalizeExtractedText(result.value);

    if (text === null) {
      return {
        ok: false,
        method: "DOCX_PARSE",
        error: "No text content could be extracted from this document.",
      };
    }

    return {
      ok: true,
      method: "DOCX_PARSE",
      text,
      pageCount: null, // mammoth doesn't provide page count
      ocrConfidence: null,
    };
  } catch (e) {
    return {
      ok: false,
      method: "DOCX_PARSE",
      error: e instanceof Error ? e.message : "DOCX extraction failed",
    };
  }
}
