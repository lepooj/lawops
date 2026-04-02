# Document Handling

## Supported Formats

| Format     | Extension | Extraction Library | Notes                                    |
| ---------- | --------- | ------------------ | ---------------------------------------- |
| PDF        | `.pdf`    | pdf-parse          | Text-based PDFs only. No OCR.            |
| Word       | `.docx`   | mammoth            | Extracts text content, strips formatting |
| Plain text | `.txt`    | Direct read        | UTF-8                                    |

## Upload Flow

1. User drags/drops files or uses file picker
2. Client validates: extension check, size preview
3. `POST /api/upload` with multipart form data
4. Server validates:
   - Extension in allowlist (PDF, DOCX, TXT)
   - MIME type matches extension
   - File size ≤ 25MB
   - Matter has < 5 documents
5. File saved to `./data/uploads/{uuid}.{ext}`
6. Text extraction runs inline (synchronous)
7. Document record created with extraction result

## Text Extraction

- **Inline on upload** — no background jobs
- Expected latency: < 5 seconds for reasonable documents
- Extracted text stored in `Document.extractedText`
- Extraction status: `PENDING` → `COMPLETE` or `FAILED`

### Failure Handling

- Extraction failure is **non-fatal**
- Document shows "Extraction failed" status badge
- Analysis can proceed without that document's text
- User can delete and re-upload

## Text Truncation for AI

- Each document's extracted text truncated to **3000 characters** when sent to model
- Maximum **5 documents** included per analysis run
- Truncation happens in `prompt-builder.ts`, not on storage

## Storage

- Local filesystem: `./data/uploads/`
- UUID filenames — original filename stored in DB for display only
- No public URLs — files served through authenticated API route
- `./data/uploads/` is gitignored

## File Display

Each document in the list shows:

- Original filename
- Document type badge (Pleading / Evidence / Case Law / Statute / Other)
- File size
- Extraction status indicator

## What's NOT in Scope

- **OCR** — scanned PDFs will show "Extraction failed." This is acceptable for pilot.
- **Document preview** — no in-app PDF/DOCX viewer. Display metadata + extraction status only.
- **Document versioning** — one version per upload.
- **Malware scanning** — trusted pilot users only.
