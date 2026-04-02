/**
 * Tests for upload validation helpers.
 */

import {
  validateFileMetadata,
  detectMimeFromBytes,
  isMagicByteConsistent,
  parseDocumentType,
  formatFileSize,
} from "../upload-validation";

// === validateFileMetadata ===

describe("validateFileMetadata", () => {
  it("accepts a valid PDF", () => {
    const result = validateFileMetadata({
      name: "brief.pdf",
      size: 1024,
      type: "application/pdf",
    });
    expect(result.valid).toBe(true);
    expect(result.extension).toBe(".pdf");
  });

  it("accepts a valid JPEG", () => {
    const result = validateFileMetadata({
      name: "scan.jpg",
      size: 5000,
      type: "image/jpeg",
    });
    expect(result.valid).toBe(true);
  });

  it("accepts a valid HEIC", () => {
    const result = validateFileMetadata({
      name: "photo.heic",
      size: 5000,
      type: "image/heic",
    });
    expect(result.valid).toBe(true);
  });

  it("rejects unsupported extension", () => {
    const result = validateFileMetadata({
      name: "malware.exe",
      size: 1024,
      type: "application/octet-stream",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("not supported");
  });

  it("rejects no extension", () => {
    const result = validateFileMetadata({
      name: "noext",
      size: 1024,
      type: "text/plain",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("no extension");
  });

  it("rejects file exceeding size limit", () => {
    const result = validateFileMetadata({
      name: "huge.pdf",
      size: 30 * 1024 * 1024, // 30MB
      type: "application/pdf",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("limit");
  });

  it("rejects empty file", () => {
    const result = validateFileMetadata({
      name: "empty.pdf",
      size: 0,
      type: "application/pdf",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("empty");
  });

  it("rejects MIME/extension mismatch (PDF extension with JPEG MIME)", () => {
    const result = validateFileMetadata({
      name: "fake.pdf",
      size: 1024,
      type: "image/jpeg",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("does not match");
  });

  it("rejects supported extension with unsupported MIME", () => {
    const result = validateFileMetadata({
      name: "file.pdf",
      size: 1024,
      type: "application/octet-stream",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("MIME type");
  });
});

// === detectMimeFromBytes ===

describe("detectMimeFromBytes", () => {
  it("detects PDF", () => {
    const buf = Buffer.from("%PDF-1.4 rest of header", "ascii");
    expect(detectMimeFromBytes(buf)).toBe("application/pdf");
  });

  it("detects JPEG", () => {
    const buf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]);
    expect(detectMimeFromBytes(buf)).toBe("image/jpeg");
  });

  it("detects PNG", () => {
    const buf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
    expect(detectMimeFromBytes(buf)).toBe("image/png");
  });

  it("detects ZIP-based (DOCX)", () => {
    const buf = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
    expect(detectMimeFromBytes(buf)).toBe("application/zip-based");
  });

  it("returns null for plain text", () => {
    const buf = Buffer.from("Hello, this is plain text content.");
    expect(detectMimeFromBytes(buf)).toBeNull();
  });

  it("returns null for very short buffer", () => {
    const buf = Buffer.from([0x00]);
    expect(detectMimeFromBytes(buf)).toBeNull();
  });
});

// === isMagicByteConsistent ===

describe("isMagicByteConsistent", () => {
  it("allows PDF when detected and declared match", () => {
    expect(isMagicByteConsistent("application/pdf", "application/pdf")).toBe(true);
  });

  it("rejects PDF declared but JPEG detected", () => {
    expect(isMagicByteConsistent("application/pdf", "image/jpeg")).toBe(false);
  });

  it("allows text/plain when nothing detected", () => {
    expect(isMagicByteConsistent("text/plain", null)).toBe(true);
  });

  it("allows DOCX when ZIP-based detected", () => {
    expect(
      isMagicByteConsistent(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/zip-based"
      )
    ).toBe(true);
  });

  it("rejects random MIME when ZIP-based detected", () => {
    expect(isMagicByteConsistent("image/png", "application/zip-based")).toBe(false);
  });

  it("allows HEIF when HEIC detected", () => {
    expect(isMagicByteConsistent("image/heif", "image/heic")).toBe(true);
  });
});

// === parseDocumentType ===

describe("parseDocumentType", () => {
  it("returns valid type as-is", () => {
    expect(parseDocumentType("PLEADING")).toBe("PLEADING");
    expect(parseDocumentType("EVIDENCE")).toBe("EVIDENCE");
    expect(parseDocumentType("CASE_LAW")).toBe("CASE_LAW");
  });

  it("returns OTHER for invalid type", () => {
    expect(parseDocumentType("INVALID")).toBe("OTHER");
    expect(parseDocumentType("")).toBe("OTHER");
  });
});

// === formatFileSize ===

describe("formatFileSize", () => {
  it("formats bytes", () => {
    expect(formatFileSize(500)).toBe("500 B");
  });

  it("formats KB", () => {
    expect(formatFileSize(2048)).toBe("2 KB");
  });

  it("formats MB", () => {
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5.0 MB");
  });

  it("formats fractional MB", () => {
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
  });
});
