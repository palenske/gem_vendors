-- CreateEnum
CREATE TYPE "ResellerStatus" AS ENUM ('ATIVA', 'INATIVA', 'EM_PROSPECCAO');

-- CreateTable
CREATE TABLE "Reseller" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "status" "ResellerStatus" NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "geocodedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reseller_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reseller_status_idx" ON "Reseller"("status");

-- CreateIndex
CREATE INDEX "Reseller_zipCode_idx" ON "Reseller"("zipCode");

-- CreateIndex
CREATE INDEX "Reseller_city_idx" ON "Reseller"("city");
