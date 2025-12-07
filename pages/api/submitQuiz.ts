import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@auth0/nextjs-auth0'
import { PrismaClient } from '@prisma/client'

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

  console.log('🔍 Debug - Session user:', {
    sub: session.user.sub,
    email: session.user.email,
    userId: userId,
  })

  if (!quizId || !lessonId || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Get the internal user id
    const user = await prisma.user.findUnique({ where: { auth0Id: userId } })
    console.log('🔍 Debug - User lookup result:', {
      user: user ? { id: user.id, email: user.email } : null,
    })

    if (!user) {
      console.log('❌ User not found in database. Available users:')
      const allUsers = await prisma.user.findMany({
        select: { id: true, auth0Id: true, email: true },
      })
      console.log(allUsers)
      return res.status(404).json({ error: 'User not found' })
    }

    // Save each answer
    for (const answer of answers) {
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
