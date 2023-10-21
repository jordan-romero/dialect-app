/*
  Warnings:

  - You are about to drop the column `courseName` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `Homework` table. All the data in the column will be lost.
  - You are about to drop the column `homeworkName` on the `Homework` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the column `resourceName` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the column `resourceType` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the column `resourceUrl` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `MediaFile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Quiz` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserCourse` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `moduleList` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moduleId` to the `Homework` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Homework` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moduleId` to the `Resource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Resource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Resource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Homework" DROP CONSTRAINT "Homework_courseId_fkey";

-- DropForeignKey
ALTER TABLE "MediaFile" DROP CONSTRAINT "MediaFile_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Resource" DROP CONSTRAINT "Resource_courseId_fkey";

-- DropForeignKey
ALTER TABLE "UserCourse" DROP CONSTRAINT "UserCourse_courseId_fkey";

-- DropForeignKey
ALTER TABLE "UserCourse" DROP CONSTRAINT "UserCourse_userId_fkey";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "courseName",
DROP COLUMN "description",
DROP COLUMN "price",
ADD COLUMN     "completedStatus" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gatingMechanism" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "moduleList" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Homework" DROP COLUMN "courseId",
DROP COLUMN "homeworkName",
ADD COLUMN     "moduleId" INTEGER NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "courseId",
DROP COLUMN "resourceName",
DROP COLUMN "resourceType",
DROP COLUMN "resourceUrl",
ADD COLUMN     "moduleId" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "username" TEXT NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- DropTable
DROP TABLE "MediaFile";

-- DropTable
DROP TABLE "Quiz";

-- DropTable
DROP TABLE "UserCourse";

-- CreateTable
CREATE TABLE "Module" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "completedStatus" BOOLEAN NOT NULL DEFAULT false,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
