import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MAX_FILES_PER_MATTER } from "@/lib/constants";
import { generateStoragePath, saveFile, deleteFile } from "@/server/lib/file-storage";
import {
  validateFileMetadata,
  detectMimeFromBytes,
  isMagicByteConsistent,
  parseDocumentType,
} from "@/server/lib/upload-validation";
import { extractDocument } from "@/server/lib/document-extraction/extract-document";

export async function POST(request: NextRequest) {
  // Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  let savedStoragePath: string | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const matterId = formData.get("matterId") as string | null;
    const documentType = (formData.get("documentType") as string) || "OTHER";

    // Validate required fields
    if (!file || !matterId) {
      return NextResponse.json(
        { error: "File and matterId are required" },
        { status: 400 }
      );
    }

    // Validate matter ownership
    const matter = await db.matter.findFirst({
      where: { id: matterId, userId },
      select: { id: true, _count: { select: { documents: true } } },
    });

    if (!matter) {
      return NextResponse.json({ error: "Matter not found" }, { status: 404 });
    }

    // Validate file count limit
    if (matter._count.documents >= MAX_FILES_PER_MATTER) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES_PER_MATTER} documents per matter` },
        { status: 400 }
      );
    }

    // Validate file metadata (extension, MIME, size, consistency)
    const validation = validateFileMetadata({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Read file bytes
    const buffer = Buffer.from(await file.arrayBuffer());

    // Magic-byte content check
    const detectedMime = detectMimeFromBytes(buffer);
    if (!isMagicByteConsistent(file.type, detectedMime)) {
      return NextResponse.json(
        {
          error: `File content does not match declared type ${file.type}. The file may be corrupted or mislabeled.`,
        },
        { status: 400 }
      );
    }

    // Save to disk
    const { storagePath } = generateStoragePath(matterId, file.name);
    savedStoragePath = storagePath;
    await saveFile(storagePath, buffer);

    // Create document record
    const document = await db.document.create({
      data: {
        matterId,
        userId,
        originalFilename: file.name,
        storagePath,
        mimeType: file.type,
        fileSize: file.size,
        documentType: parseDocumentType(documentType),
        extractionStatus: "PROCESSING",
        includeInAnalysis: true,
      },
    });

    savedStoragePath = null; // DB record created — no cleanup needed

    // Run extraction immediately while buffer is still in memory.
    // On serverless (Vercel), the filesystem is ephemeral, so the file
    // saved to disk may not be available for a later extraction request.
    try {
      const extraction = await extractDocument(buffer, file.type);

      if (extraction.ok) {
        await db.document.update({
          where: { id: document.id },
          data: {
            extractionStatus: "COMPLETE",
            extractionMethod: extraction.method,
            extractedText: extraction.text || null,
            pageCount: extraction.pageCount,
            ocrConfidence: extraction.ocrConfidence,
            extractionError: null,
          },
        });
      } else {
        await db.document.update({
          where: { id: document.id },
          data: {
            extractionStatus: "FAILED",
            extractionMethod: extraction.method,
            extractionError: extraction.error,
          },
        });
      }
    } catch (extractionErr) {
      // Extraction failure is non-fatal — the document is still uploaded
      await db.document.update({
        where: { id: document.id },
        data: {
          extractionStatus: "FAILED",
          extractionError:
            extractionErr instanceof Error
              ? extractionErr.message
              : "Extraction failed",
        },
      });
    }

    // Return the updated document
    const updatedDoc = await db.document.findUnique({
      where: { id: document.id },
      select: {
        id: true,
        originalFilename: true,
        mimeType: true,
        fileSize: true,
        documentType: true,
        extractionStatus: true,
        extractionMethod: true,
        extractionError: true,
        ocrConfidence: true,
        includeInAnalysis: true,
        uploadedAt: true,
      },
    });

    return NextResponse.json({ document: updatedDoc }, { status: 201 });
  } catch (e) {
    // If we saved a file but DB insert failed, clean up the orphaned file
    if (savedStoragePath) {
      await deleteFile(savedStoragePath).catch(() => {
        // Best-effort cleanup — don't mask the original error
      });
    }

    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
