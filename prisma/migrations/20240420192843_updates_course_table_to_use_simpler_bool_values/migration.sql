/*
  Warnings:

  - You are about to drop the column `price` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `progress` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "price",
DROP COLUMN "progress",
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isGatedCourse" BOOLEAN NOT NULL DEFAULT true;
