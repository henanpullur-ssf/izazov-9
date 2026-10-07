-- AlterTable Participant
ALTER TABLE "Participant" ADD COLUMN IF NOT EXISTS "rollNumber" TEXT;

-- CreateIndex on Participant
CREATE INDEX IF NOT EXISTS "Participant_rollNumber_idx" ON "Participant"("rollNumber");

-- AlterTable House
ALTER TABLE "House" ADD COLUMN IF NOT EXISTS "managerId" TEXT;
ALTER TABLE "House" ADD COLUMN IF NOT EXISTS "assistantManagerId" TEXT;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'House_managerId_fkey'
    ) THEN
        ALTER TABLE "House" ADD CONSTRAINT "House_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'House_assistantManagerId_fkey'
    ) THEN
        ALTER TABLE "House" ADD CONSTRAINT "House_assistantManagerId_fkey" FOREIGN KEY ("assistantManagerId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AlterTable Result
ALTER TABLE "Result" ADD COLUMN IF NOT EXISTS "points" DECIMAL(8,2) DEFAULT 0;
ALTER TABLE "Result" ADD COLUMN IF NOT EXISTS "grade" TEXT;
ALTER TABLE "Result" ADD COLUMN IF NOT EXISTS "prizeLevel" TEXT;
ALTER TABLE "Result" ADD COLUMN IF NOT EXISTS "remarks" TEXT;
ALTER TABLE "Result" ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex on Result
CREATE INDEX IF NOT EXISTS "Result_isPublished_idx" ON "Result"("isPublished");

-- Safe backfill for existing results so points match totalMarks
UPDATE "Result" SET "points" = "totalMarks" WHERE "points" IS NULL OR "points" = 0;
