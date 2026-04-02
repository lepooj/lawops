/**
 * PDF text extraction using pdf-parse.
 */

import pdfParse from "pdf-parse";
import type { ExtractionResult } from "../types";
import { normalizeExtractedText } from "../types";

export async function extractPdf(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const result = await pdfParse(buffer);
    const text = normalizeExtractedText(result.text);
    const pageCount = result.numpages ?? null;

    // Detect likely scanned PDF: multi-page but almost no extractable text
    if (text === null && pageCount !== null && pageCount > 0) {
      return {
        ok: false,
        method: "PDF_PARSE",
        error:
          "This PDF appears to be scanned or image-based. No text could be extracted. " +
          "Upload as individual page images (JPG/PNG) for OCR processing, or use a text-based PDF.",
      };
    }

    if (text === null) {
      return {
        ok: false,
        method: "PDF_PARSE",
        error: "No text content could be extracted from this PDF.",
      };
    }

    return {
      ok: true,
      method: "PDF_PARSE",
      text,
      pageCount,
      ocrConfidence: null,
    };
  } catch (e) {
    return {
      ok: false,
      method: "PDF_PARSE",
      error: e instanceof Error ? e.message : "PDF extraction failed",
    };
  }
}
