/*
  Warnings:

  - A unique constraint covering the columns `[userId,lessonId]` on the table `LessonProgress` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,questionId,quizId]` on the table `UserAnswer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_userId_lessonId_key" ON "LessonProgress"("userId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAnswer_userId_questionId_quizId_key" ON "UserAnswer"("userId", "questionId", "quizId");
