-- Extend the existing Farm table without discarding pre-existing records.
ALTER TABLE "Farm"
  ADD COLUMN "ownerId" TEXT,
  ADD COLUMN "latitude" DOUBLE PRECISION,
  ADD COLUMN "longitude" DOUBLE PRECISION,
  ADD COLUMN "boundary" JSONB,
  ADD COLUMN "areaHectares" DOUBLE PRECISION,
  ADD COLUMN "perimeterMeters" DOUBLE PRECISION,
  ADD COLUMN "soilType" TEXT,
  ADD COLUMN "waterSource" TEXT,
  ADD COLUMN "surveyMethod" TEXT,
  ADD COLUMN "requestKey" TEXT,
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'Healthy',
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX "Farm_requestKey_key" ON "Farm"("requestKey");
CREATE INDEX "Farm_ownerId_idx" ON "Farm"("ownerId");

ALTER TABLE "Farm"
  ADD CONSTRAINT "Farm_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Crop" (
  "id" TEXT NOT NULL,
  "farmId" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "variety" TEXT,
  "sowingDate" TEXT NOT NULL,
  "expectedHarvest" TEXT,
  "lifecycleType" TEXT NOT NULL DEFAULT 'ANNUAL',
  "establishmentPeriodMonths" INTEGER,
  "maturityPeriodMonths" INTEGER,
  "firstExpectedHarvest" TEXT,
  "harvestIntervalMonths" INTEGER,
  "maintenanceSchedule" JSONB,
  "growthStage" TEXT NOT NULL,
  "area" DOUBLE PRECISION NOT NULL,
  "waterNeed" TEXT NOT NULL,
  "health" TEXT,
  "diseaseStatus" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Crop_farmId_idx" ON "Crop"("farmId");
ALTER TABLE "Crop"
  ADD CONSTRAINT "Crop_farmId_fkey"
  FOREIGN KEY ("farmId") REFERENCES "Farm"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
