-- Nothing ever read or wrote these (all NULL on the dev database). Kept in its
-- own migration so it can be applied after the code that stops selecting them
-- is deployed: an older Prisma client still selects both columns.
ALTER TABLE "LessonProgress" DROP COLUMN "quizPassed",
DROP COLUMN "quizScore";
