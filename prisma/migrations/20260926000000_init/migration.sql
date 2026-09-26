-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('COMPANY', 'MERCHANT');

-- CreateEnum
CREATE TYPE "EntityIcon" AS ENUM ('building', 'hospital', 'edu', 'media', 'food', 'retail', 'gold', 'mall');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MED', 'LOW');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('BELUM_TERGARAP', 'PROSPEK_HANGAT', 'EXISTING_BANK_LAIN', 'NASABAH_MANDIRI');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('BELUM_ADA', 'QRIS_BANK_LAIN', 'EDC_BANK_LAIN', 'SUDAH_MANDIRI');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('TINGGI', 'SEDANG', 'RENDAH');

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "radiusM" INTEGER NOT NULL DEFAULT 2000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "EntityType" NOT NULL,
    "category" TEXT NOT NULL,
    "icon" "EntityIcon" NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "priority" "Priority" NOT NULL,
    "score" INTEGER NOT NULL,
    "profile" TEXT NOT NULL,
    "employeeEstimate" INTEGER,
    "payrollStatus" "PayrollStatus",
    "creditPotential" "Level",
    "paymentStatus" "PaymentStatus",
    "turnoverEstimate" "Level",
    "productFit" TEXT,
    "isAnchor" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "picName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Entity_type_idx" ON "Entity"("type");

-- CreateIndex
CREATE INDEX "Entity_priority_idx" ON "Entity"("priority");

