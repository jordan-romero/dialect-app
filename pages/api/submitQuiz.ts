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

    // Save each answer
    for (const answer of cleanAnswers) {
      const existingAnswer = await prisma.userAnswer.findFirst({
        where: {
          userId: user.id,
          questionId: answer.questionId,
          quizId: quizId,
        },
      })

      if (existingAnswer) {
        await prisma.userAnswer.update({
          where: { id: existingAnswer.id },
          data: { textAnswer: answer.textAnswer },
        })
      } else {
        await prisma.userAnswer.create({
          data: {
            userId: user.id,
            quizId: quizId,
            questionId: answer.questionId,
            textAnswer: answer.textAnswer,
          },
        })
      }
    }

    // Mark quiz as completed for this user/lesson
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
          progress: 100,
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
