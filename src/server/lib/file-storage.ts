/**
 * Local filesystem storage for uploaded documents.
 *
 * Files are stored at: ./data/uploads/{matterId}/{uuid}.{ext}
 * UUID filenames prevent path traversal and information leakage.
 */

import { mkdir, writeFile, readFile as fsReadFile, unlink, stat } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "data", "uploads");

/** Generate a safe storage path for a new upload. */
export function generateStoragePath(
  matterId: string,
  originalFilename: string
): { storagePath: string; absolutePath: string } {
  const ext = path.extname(originalFilename).toLowerCase();
  const uuid = crypto.randomUUID();
  const filename = `${uuid}${ext}`;
  const storagePath = `${matterId}/${filename}`;
  const absolutePath = path.join(UPLOAD_ROOT, storagePath);

  return { storagePath, absolutePath };
}

/** Save file bytes to disk. Creates matter directory if needed. */
export async function saveFile(
  storagePath: string,
  data: Buffer
): Promise<void> {
  const absolutePath = path.join(UPLOAD_ROOT, storagePath);
  const dir = path.dirname(absolutePath);

  await mkdir(dir, { recursive: true });
  await writeFile(absolutePath, data);
}

/** Delete a file from disk. Silently succeeds if file doesn't exist. */
export async function deleteFile(storagePath: string): Promise<void> {
  const absolutePath = path.join(UPLOAD_ROOT, storagePath);

  try {
    await unlink(absolutePath);
  } catch (e) {
    // File may already be deleted — not an error
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
}

/** Read file bytes from disk. */
export async function readFile(storagePath: string): Promise<Buffer> {
  const absolutePath = path.join(UPLOAD_ROOT, storagePath);
  return fsReadFile(absolutePath);
}

/** Check if a file exists. */
export async function fileExists(storagePath: string): Promise<boolean> {
  try {
    await stat(path.join(UPLOAD_ROOT, storagePath));
    return true;
  } catch {
    return false;
  }
}
