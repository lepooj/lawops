"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/server/auth-guard";
import { deleteFile, readFile } from "@/server/lib/file-storage";
import { extractDocument } from "@/server/lib/document-extraction/extract-document";
import { revalidatePath } from "next/cache";

// === Schemas ===

const documentTypeSchema = z.enum([
  "PLEADING",
  "EVIDENCE",
  "CASE_LAW",
  "STATUTE",
  "CORRESPONDENCE",
  "OTHER",
]);

// === Actions ===

export async function listDocuments(matterId: string) {
  const user = await requireUser();

  // Verify ownership
  const matter = await db.matter.findFirst({
    where: { id: matterId, userId: user.id },
    select: { id: true },
  });

  if (!matter) return [];

  return db.document.findMany({
    where: { matterId },
    orderBy: { uploadedAt: "desc" },
    select: {
      id: true,
      originalFilename: true,
      mimeType: true,
      fileSize: true,
      documentType: true,
      extractionMethod: true,
      extractionStatus: true,
      extractionError: true,
      extractedText: true,
      ocrConfidence: true,
      pageCount: true,
      includeInAnalysis: true,
      uploadedAt: true,
    },
  });
}

export async function updateDocumentType(
  documentId: string,
  matterId: string,
  documentType: string
): Promise<{ success: true } | { error: string }> {
  const user = await requireUser();

  const parsed = documentTypeSchema.safeParse(documentType);
  if (!parsed.success) {
    return { error: "Invalid document type" };
  }

  // Verify ownership through matter
  const doc = await db.document.findFirst({
    where: {
      id: documentId,
      matterId,
      matter: { userId: user.id },
    },
    select: { id: true },
  });

  if (!doc) {
    return { error: "Document not found" };
  }

  await db.document.update({
    where: { id: documentId },
    data: { documentType: parsed.data },
  });

  revalidatePath(`/matters/${matterId}`);
  return { success: true };
}

export async function toggleIncludeInAnalysis(
  documentId: string,
  matterId: string,
  include: boolean
): Promise<{ success: true } | { error: string }> {
  const user = await requireUser();

  const doc = await db.document.findFirst({
    where: {
      id: documentId,
      matterId,
      matter: { userId: user.id },
    },
    select: { id: true },
  });

  if (!doc) {
    return { error: "Document not found" };
  }

  await db.document.update({
    where: { id: documentId },
    data: { includeInAnalysis: include },
  });

  revalidatePath(`/matters/${matterId}`);
  return { success: true };
}

export async function deleteDocument(
  documentId: string,
  matterId: string
): Promise<{ success: true } | { error: string }> {
  const user = await requireUser();

  const doc = await db.document.findFirst({
    where: {
      id: documentId,
      matterId,
      matter: { userId: user.id },
    },
    select: { id: true, storagePath: true },
  });

  if (!doc) {
    return { error: "Document not found" };
  }

  // Delete DB record first (authoritative), then file from disk.
  // If DB delete succeeds but file delete fails, we have an orphaned file
  // (harmless) rather than an orphaned DB record (broken reference).
  await db.document.delete({ where: { id: documentId } });
  await deleteFile(doc.storagePath);

  revalidatePath(`/matters/${matterId}`);
  return { success: true };
}

/**
 * Process (extract text from) a single document.
 * Reads the file from disk, runs the appropriate extractor, and updates the DB record.
 */
export async function processDocument(
  documentId: string,
  matterId: string
): Promise<{ success: true } | { error: string }> {
  const user = await requireUser();

  const doc = await db.document.findFirst({
    where: {
      id: documentId,
      matterId,
      matter: { userId: user.id },
    },
    select: {
      id: true,
      storagePath: true,
      mimeType: true,
    },
  });

  if (!doc) {
    return { error: "Document not found" };
  }

  // Mark as processing
  await db.document.update({
    where: { id: documentId },
    data: { extractionStatus: "PROCESSING", extractionError: null },
  });

  try {
    const buffer = await readFile(doc.storagePath);
    const result = await extractDocument(buffer, doc.mimeType);

    if (result.ok) {
      await db.document.update({
        where: { id: documentId },
        data: {
          extractionStatus: "COMPLETE",
          extractionMethod: result.method,
          extractedText: result.text || null,
          pageCount: result.pageCount,
          ocrConfidence: result.ocrConfidence,
          extractionError: null,
        },
      });
    } else {
      await db.document.update({
        where: { id: documentId },
        data: {
          extractionStatus: "FAILED",
          extractionMethod: result.method,
          extractionError: result.error,
          extractedText: null,
          ocrConfidence: null,
          pageCount: null,
        },
      });
    }
  } catch (e) {
    await db.document.update({
      where: { id: documentId },
      data: {
        extractionStatus: "FAILED",
        extractionError:
          e instanceof Error ? e.message : "Extraction failed unexpectedly",
      },
    });
  }

  revalidatePath(`/matters/${matterId}`);
  return { success: true };
}

/**
 * Process all pending/failed documents for a matter.
 * Runs extraction sequentially to avoid overloading the server.
 */
export async function processAllPending(
  matterId: string
): Promise<{ processed: number; failed: number } | { error: string }> {
  const user = await requireUser();

  const matter = await db.matter.findFirst({
    where: { id: matterId, userId: user.id },
    select: { id: true },
  });

  if (!matter) {
    return { error: "Matter not found" };
  }

  const pendingDocs = await db.document.findMany({
    where: {
      matterId,
      extractionStatus: { in: ["PENDING", "FAILED"] },
    },
    select: { id: true },
  });

  let processed = 0;
  let failed = 0;

  for (const doc of pendingDocs) {
    const result = await processDocument(doc.id, matterId);
    if ("error" in result) {
      failed++;
    } else {
      processed++;
    }
  }

  return { processed, failed };
}
