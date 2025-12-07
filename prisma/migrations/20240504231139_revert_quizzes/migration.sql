/*
  Warnings:

  - A unique constraint covering the columns `[lessonId]` on the table `Quiz` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Quiz_lessonId_key" ON "Quiz"("lessonId");
