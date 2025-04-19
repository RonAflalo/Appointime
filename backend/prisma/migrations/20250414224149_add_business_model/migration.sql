/*
  Warnings:

  - You are about to drop the column `flag` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `visit_count` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `cta_link` on the `FeatureCard` table. All the data in the column will be lost.
  - You are about to drop the column `cta_text` on the `FeatureCard` table. All the data in the column will be lost.
  - You are about to drop the column `cta_text_he` on the `FeatureCard` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `business_details` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `features_section` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `hero_section` on the `SiteSettings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[businessId]` on the table `SiteSettings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `businessId` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessId` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessId` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessId` to the `SiteSettings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_client_id_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_user_id_fkey";

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "businessId" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "flag",
DROP COLUMN "notes",
DROP COLUMN "user_id",
DROP COLUMN "visit_count",
ADD COLUMN     "businessId" TEXT NOT NULL,
ADD COLUMN     "managerId" TEXT;

-- AlterTable
ALTER TABLE "FeatureCard" DROP COLUMN "cta_link",
DROP COLUMN "cta_text",
DROP COLUMN "cta_text_he";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "notes",
DROP COLUMN "status",
ADD COLUMN     "businessId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "businessId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SiteSettings" DROP COLUMN "business_details",
DROP COLUMN "features_section",
DROP COLUMN "hero_section",
ADD COLUMN     "businessId" TEXT NOT NULL,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'he',
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Asia/Jerusalem',
ADD COLUMN     "working_hours" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "businessId" TEXT;

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Business_slug_key" ON "Business"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_businessId_key" ON "SiteSettings"("businessId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
