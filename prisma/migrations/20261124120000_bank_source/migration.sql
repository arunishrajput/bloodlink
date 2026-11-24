-- AlterTable
ALTER TABLE "BloodBank" ADD COLUMN "openingHours" TEXT,
ADD COLUMN "website" TEXT,
ADD COLUMN "source" TEXT,
ADD COLUMN "externalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "BloodBank_externalId_key" ON "BloodBank"("externalId");
