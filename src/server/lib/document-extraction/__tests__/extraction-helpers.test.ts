/**
 * Tests for document extraction pure helpers.
 */

import {
  normalizeExtractedText,
  isOcrMimeType,
  isHeicMimeType,
  MIN_MEANINGFUL_TEXT_LENGTH,
} from "../types";

// === normalizeExtractedText ===

describe("normalizeExtractedText", () => {
  it("returns trimmed text for valid content", () => {
    expect(normalizeExtractedText("  Hello world  ")).toBe("Hello world");
  });

  it("returns null for empty string", () => {
    expect(normalizeExtractedText("")).toBeNull();
  });

  it("returns null for whitespace-only", () => {
    expect(normalizeExtractedText("    \n\t   ")).toBeNull();
  });

  it("returns null for text shorter than minimum", () => {
    expect(normalizeExtractedText("Hi")).toBeNull();
    expect(normalizeExtractedText("  ab ")).toBeNull();
  });

  it(`returns text at exactly ${MIN_MEANINGFUL_TEXT_LENGTH} chars`, () => {
    const text = "A".repeat(MIN_MEANINGFUL_TEXT_LENGTH);
    expect(normalizeExtractedText(text)).toBe(text);
  });

  it("preserves internal whitespace and newlines", () => {
    const text = "Line one\n\nLine two\n\nLine three";
    expect(normalizeExtractedText(text)).toBe(text);
  });
});

// === isOcrMimeType ===

describe("isOcrMimeType", () => {
  it("returns true for image types", () => {
    expect(isOcrMimeType("image/jpeg")).toBe(true);
    expect(isOcrMimeType("image/png")).toBe(true);
    expect(isOcrMimeType("image/heic")).toBe(true);
    expect(isOcrMimeType("image/heif")).toBe(true);
  });

  it("returns false for non-image types", () => {
    expect(isOcrMimeType("application/pdf")).toBe(false);
    expect(isOcrMimeType("text/plain")).toBe(false);
    expect(isOcrMimeType("application/vnd.openxmlformats-officedocument.wordprocessingml.document")).toBe(false);
  });
});

// === isHeicMimeType ===

describe("isHeicMimeType", () => {
  it("returns true for HEIC/HEIF", () => {
    expect(isHeicMimeType("image/heic")).toBe(true);
    expect(isHeicMimeType("image/heif")).toBe(true);
  });

  it("returns false for JPEG/PNG", () => {
    expect(isHeicMimeType("image/jpeg")).toBe(false);
    expect(isHeicMimeType("image/png")).toBe(false);
  });
});
