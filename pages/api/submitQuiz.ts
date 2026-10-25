import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@auth0/nextjs-auth0'
import { PrismaClient } from '@prisma/client'
import { hasPaidAccess, getUnlockedCourseIds } from '../../lib/access'
import { getUserByAuth0Id } from '../../lib/user'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getSession(req, res)
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userId = session.user.sub
  const { quizId, lessonId, answers } = req.body

  if (!quizId || !lessonId || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Get the internal user id
    const user = await getUserByAuth0Id(prisma, userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Validate the quiz exists and actually belongs to the claimed lesson,
    // and load its real question ids for answer validation.
    const quiz = await prisma.quiz.findUnique({
      where: { id: Number(quizId) },
      select: { id: true, lessonId: true, questions: { select: { id: true } } },
    })
    if (!quiz || quiz.lessonId !== Number(lessonId)) {
      return res.status(400).json({ error: 'Quiz does not match lesson' })
    }

    // Enforce access server-side (the DB has no RLS, so this is the real gate):
    // the lesson's phase must be unlocked, and gated lessons require purchase.
    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(lessonId) },
      select: { courseId: true, isGatedLesson: true },
    })
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' })
    }
    const email = session.user.email
    const [paid, unlocked] = await Promise.all([
      hasPaidAccess(prisma, email),
      getUnlockedCourseIds(prisma, email),
    ])
    if (!unlocked.has(lesson.courseId) || (lesson.isGatedLesson && !paid)) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Only accept answers that reference a real question in THIS quiz.
    const validQuestionIds = new Set(quiz.questions.map((q) => q.id))
    const cleanAnswers = (answers as any[]).filter(
      (a) =>
        a &&
        typeof a.questionId === 'number' &&
        validQuestionIds.has(a.questionId) &&
        typeof a.textAnswer === 'string',
    )

    // Completion is only earned by covering every question in the quiz.
    // Filtering invalid entries isn't enough on its own: an empty or partial
    // array would otherwise still fall through and mark the lesson complete
    // (progress: 100), letting a caller advance phase gating without actually
    // answering the quiz.
    const submittedQuestionIds = new Set(
      cleanAnswers.map((a) => a.questionId as number),
    )
    const coversEveryQuestion =
      quiz.questions.length > 0 &&
      quiz.questions.every((q) => submittedQuestionIds.has(q.id))
    if (!coversEveryQuestion) {
      return res
        .status(400)
        .json({ error: 'Answer every question before completing the quiz' })
    }

    // Save every answer in one statement. The per-answer find-then-write loop
    // this replaces cost two database round trips per question, which against
    // the hosted database made a 31-question save take ~40s. Upserting on the
    // (userId, questionId, quizId) unique key keeps each row's createdAt, which
    // the streak counts. One entry per question: Postgres won't upsert the same
    // row twice in a statement, and the last answer sent is the one to keep.
    const latest = new Map<number, string>()
    cleanAnswers.forEach((a) => latest.set(a.questionId, a.textAnswer))
    await prisma.$executeRaw`
      INSERT INTO "UserAnswer"
        ("quizId", "questionId", "userId", "textAnswer", "createdAt", "updatedAt")
      SELECT ${Number(quizId)}, q, ${user.id}, t, now(), now()
      FROM unnest(
        ${Array.from(latest.keys())}::int[],
        ${Array.from(latest.values())}::text[]
      ) AS a(q, t)
      ON CONFLICT ("userId", "questionId", "quizId")
      DO UPDATE SET "textAnswer" = EXCLUDED."textAnswer", "updatedAt" = now()
    `

    // Mark quiz as completed for this user/lesson. This records that an
    // exercise was done, not that the lesson was: progress reaches 100 only
    // when the learner finishes the lesson (/api/updateProgress). Creating the
    // row at 100 here made a lesson count as complete after its first
    // exercise, which awarded lesson badges (e.g. Checkpoint Champion) early.
    const existingProgress = await prisma.lessonProgress.findFirst({
      where: {
        userId: user.id,
        lessonId: lessonId,
      },
    })

    if (existingProgress) {
      await prisma.lessonProgress.update({
        where: { id: existingProgress.id },
        data: { hasQuizBeenCompleted: true },
      })
    } else {
      await prisma.lessonProgress.create({
        data: {
          userId: user.id,
          lessonId: lessonId,
          progress: 0,
          hasQuizBeenCompleted: true,
        },
      })
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
