/**
 * Document extraction orchestrator.
 *
 * Routes a file buffer to the correct extractor based on MIME type.
 * Returns a typed ExtractionResult.
 */

import type { ExtractionResult } from "./types";
import { isOcrMimeType } from "./types";
import { extractPdf } from "./extractors/pdf";
import { extractDocx } from "./extractors/docx";
import { extractTxt } from "./extractors/txt";
import { extractOcr } from "./extractors/ocr";

/**
 * Extract text from a document buffer.
 *
 * @param buffer - The file content
 * @param mimeType - The validated MIME type of the file
 * @returns ExtractionResult with text and metadata, or error
 */
export async function extractDocument(
  buffer: Buffer,
  mimeType: string
): Promise<ExtractionResult> {
  if (mimeType === "application/pdf") {
    return extractPdf(buffer);
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractDocx(buffer);
  }

  if (mimeType === "text/plain") {
    return extractTxt(buffer);
  }

  if (isOcrMimeType(mimeType)) {
    return extractOcr(buffer, mimeType);
  }

  return {
    ok: false,
    method: "PLAIN_TEXT",
    error: `Unsupported MIME type for extraction: ${mimeType}`,
  };
}
