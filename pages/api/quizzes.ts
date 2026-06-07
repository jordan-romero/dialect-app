// pages/api/quiz.ts
import { NextApiRequest, NextApiResponse } from 'next'
import {
  PrismaClient,
  Quiz,
  Question,
  AnswerOption,
  ExtraOption,
} from '@prisma/client'
import { getSession } from '@auth0/nextjs-auth0'
import { signDeep } from '../../lib/s3'

const prisma = new PrismaClient()

type QuizWithQuestionsAndAnswers = Quiz & {
  questions: (Question & {
    answerOptions: AnswerOption[]
    extraOptions: ExtraOption[]
  })[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<QuizWithQuestionsAndAnswers[] | { message: string }>,
) {
  if (req.method === 'GET') {
    const session = await getSession(req, res)
    if (!session?.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const { lessonId } = req.query

    if (typeof lessonId !== 'string') {
      res.status(400).json({ message: 'Invalid lessonId' })
      return
    }

    try {
      const quizzes = await prisma.quiz.findMany({
        where: { lessonId: parseInt(lessonId) },
        orderBy: { order: 'asc' },
        include: {
          questions: {
            include: {
              answerOptions: true,
              extraOptions: true,
            },
          },
        },
      })

      if (!quizzes || quizzes.length === 0) {
        res.status(404).json({ message: 'Quizzes not found' })
        return
      }

      res.status(200).json(await signDeep(quizzes))
    } catch (error) {
      console.error('Error fetching quizzes:', error)
      res.status(500).json({ message: 'Internal Server Error' })
    } finally {
      await prisma.$disconnect()
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}
