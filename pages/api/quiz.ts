// pages/api/quiz.ts
import { NextApiRequest, NextApiResponse } from 'next'
import {
  PrismaClient,
  Quiz,
  Question,
  AnswerOption,
  ExtraOption,
} from '@prisma/client'

const prisma = new PrismaClient()

type QuizWithQuestionsAndAnswers = Quiz & {
  questions: (Question & {
    answerOptions: AnswerOption[]
    extraOptions: ExtraOption[]
  })[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<QuizWithQuestionsAndAnswers | { message: string }>,
) {
  if (req.method === 'GET') {
    const { lessonId } = req.query

    if (typeof lessonId !== 'string') {
      res.status(400).json({ message: 'Invalid lessonId' })
      return
    }

    try {
      const quiz = await prisma.quiz.findUnique({
        where: { lessonId: parseInt(lessonId) },
        include: {
          questions: {
            include: {
              answerOptions: true,
              extraOptions: true,
            },
          },
        },
      })

      if (!quiz) {
        res.status(404).json({ message: 'Quiz not found' })
        return
      }

      res.status(200).json(quiz as QuizWithQuestionsAndAnswers)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal Server Error' })
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}
