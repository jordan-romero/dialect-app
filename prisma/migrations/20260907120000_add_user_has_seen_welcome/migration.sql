-- AlterTable
-- Auth0's afterCallback reads User.hasSeenWelcome on every login, so the column
-- must exist wherever this deploys. IF NOT EXISTS keeps it safe on databases
-- that already received the column through an earlier `prisma db push`.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "hasSeenWelcome" BOOLEAN NOT NULL DEFAULT false;
