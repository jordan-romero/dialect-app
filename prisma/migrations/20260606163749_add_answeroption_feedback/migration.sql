-- Add per-answer feedback text (e.g. regional pronunciation tips shown on wrong selections).
ALTER TABLE "AnswerOption" ADD COLUMN "feedback" TEXT;
