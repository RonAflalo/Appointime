/*
  Warnings:

  - A unique constraint covering the columns `[registration_code]` on the table `Business` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "registration_code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Business_registration_code_key" ON "Business"("registration_code");
