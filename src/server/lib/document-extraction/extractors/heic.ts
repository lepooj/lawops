/**
 * HEIC to JPEG conversion for OCR processing.
 */

// heic-convert has no type declarations; import as any
// eslint-disable-next-line @typescript-eslint/no-require-imports
const heicConvert = require("heic-convert");

/**
 * Convert a HEIC/HEIF buffer to JPEG.
 * Returns the JPEG buffer for OCR processing.
 */
export async function convertHeicToJpeg(
  heicBuffer: Buffer
): Promise<Buffer> {
  const result = await heicConvert({
    buffer: heicBuffer,
    format: "JPEG",
    quality: 0.9,
  });

  return Buffer.from(result);
}
