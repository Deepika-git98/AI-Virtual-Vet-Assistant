/*
  Warnings:

  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.
  - Added the required column `title` to the `symptom_reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `symptom_reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."pets" ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "isNeutered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "medicalHistory" TEXT,
ADD COLUMN     "medications" TEXT,
ADD COLUMN     "vetInfo" TEXT;

-- AlterTable
ALTER TABLE "public"."symptom_reports" ADD COLUMN     "appetite" TEXT,
ADD COLUMN     "behaviorChanges" TEXT,
ADD COLUMN     "bodyPart" TEXT,
ADD COLUMN     "energy" TEXT,
ADD COLUMN     "frequency" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "username";
