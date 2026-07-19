import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@auth0/nextjs-auth0'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getSession(req, res)
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userId = session.user.sub
  const { quizId, lessonId } = req.query

  if (!quizId || !lessonId) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Get the internal user id
    const user = await prisma.user.findUnique({ where: { auth0Id: userId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    // Answers for THIS quiz (per-quiz, keyed by quizId).
    const answers = await prisma.userAnswer.findMany({
      where: {
        userId: user.id,
        quizId: Number(quizId),
      },
      select: {
        questionId: true,
        textAnswer: true,
      },
    })

    // Completion is per-quiz: a quiz is done when the user has saved answers
    // for it. (Previously this read the per-LESSON hasQuizBeenCompleted flag,
    // which made finishing one quiz mark every quiz in the lesson as complete.)
    const isCompleted = answers.length > 0

    return res.status(200).json({ isCompleted, answers })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
