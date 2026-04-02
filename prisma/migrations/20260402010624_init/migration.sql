-- CreateEnum
CREATE TYPE "MatterType" AS ENUM ('LITIGATION', 'REGULATORY', 'ADVISORY', 'OTHER');

-- CreateEnum
CREATE TYPE "MatterStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PLEADING', 'EVIDENCE', 'CASE_LAW', 'STATUTE', 'CORRESPONDENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "ExtractionMethod" AS ENUM ('PDF_PARSE', 'DOCX_PARSE', 'PLAIN_TEXT', 'OCR');

-- CreateEnum
CREATE TYPE "ExtractionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETE', 'FAILED');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('RUNNING', 'COMPLETE', 'FAILED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('UNREVIEWED', 'REVIEWED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "CitationSource" AS ENUM ('AI_GENERATED', 'USER_PROVIDED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'VERIFIED', 'FLAGGED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "matterType" "MatterType" NOT NULL,
    "status" "MatterStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Matter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatterIntake" (
    "id" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "province" TEXT,
    "courtLevel" TEXT,
    "jurisdictionType" TEXT,
    "areaOfLaw" TEXT,
    "facts" TEXT,
    "parties" JSONB,
    "desiredOutcome" TEXT,
    "constraints" TEXT,
    "proceduralStage" TEXT,
    "priorDecisions" TEXT,
    "keyDates" JSONB,
    "supportingAuthorities" JSONB,
    "opposingArguments" TEXT,
    "opposingAuthorities" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatterIntake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "documentType" "DocumentType" NOT NULL DEFAULT 'OTHER',
    "extractionMethod" "ExtractionMethod",
    "extractionStatus" "ExtractionStatus" NOT NULL DEFAULT 'PENDING',
    "extractedText" TEXT,
    "extractionError" TEXT,
    "ocrConfidence" DOUBLE PRECISION,
    "pageCount" INTEGER,
    "includeInAnalysis" BOOLEAN NOT NULL DEFAULT true,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisRun" (
    "id" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "runNumber" INTEGER NOT NULL,
    "status" "AnalysisStatus" NOT NULL,
    "inputSnapshot" JSONB NOT NULL,
    "documentExcerpts" JSONB NOT NULL,
    "rawOutput" TEXT,
    "promptVersion" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "latencyMs" INTEGER,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AnalysisRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisSection" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "sectionOrder" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'UNREVIEWED',

    CONSTRAINT "AnalysisSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Citation" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "citationText" TEXT NOT NULL,
    "caseName" TEXT,
    "year" INTEGER,
    "court" TEXT,
    "propositionUsedFor" TEXT,
    "source" "CitationSource" NOT NULL DEFAULT 'AI_GENERATED',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',

    CONSTRAINT "Citation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Matter_userId_status_idx" ON "Matter"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MatterIntake_matterId_key" ON "MatterIntake"("matterId");

-- CreateIndex
CREATE INDEX "Document_matterId_idx" ON "Document"("matterId");

-- CreateIndex
CREATE INDEX "AnalysisRun_matterId_idx" ON "AnalysisRun"("matterId");

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisRun_matterId_runNumber_key" ON "AnalysisRun"("matterId", "runNumber");

-- CreateIndex
CREATE INDEX "AnalysisSection_runId_idx" ON "AnalysisSection"("runId");

-- CreateIndex
CREATE INDEX "Citation_runId_idx" ON "Citation"("runId");

-- CreateIndex
CREATE INDEX "Citation_sectionId_idx" ON "Citation"("sectionId");

-- AddForeignKey
ALTER TABLE "Matter" ADD CONSTRAINT "Matter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatterIntake" ADD CONSTRAINT "MatterIntake_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisRun" ADD CONSTRAINT "AnalysisRun_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisRun" ADD CONSTRAINT "AnalysisRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisSection" ADD CONSTRAINT "AnalysisSection_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AnalysisRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AnalysisRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "AnalysisSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
