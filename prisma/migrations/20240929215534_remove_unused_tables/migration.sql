/*
  Warnings:

  - You are about to drop the column `discussionId` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Discussion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_discussionId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Discussion" DROP CONSTRAINT "Discussion_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "Discussion" DROP CONSTRAINT "Discussion_userId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_userId_fkey";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "discussionId";

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "Discussion";

-- DropTable
DROP TABLE "Post";
