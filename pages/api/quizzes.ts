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
import { hasPaidAccess, getUnlockedCourseIds } from '../../lib/access'

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
      // Gate quizzes behind phase progression + paid access.
      const lessonRow = await prisma.lesson.findUnique({
        where: { id: parseInt(lessonId) },
        select: { isGatedLesson: true, courseId: true },
      })
      if (lessonRow) {
        const email = session.user.email
        const unlockedCourses = await getUnlockedCourseIds(prisma, email)
        if (!unlockedCourses.has(lessonRow.courseId)) {
          res
            .status(403)
            .json({ message: 'Complete the previous phase to unlock this.' })
          return
        }
        if (lessonRow.isGatedLesson && !(await hasPaidAccess(prisma, email))) {
          res
            .status(403)
            .json({ message: 'This lesson requires full course access.' })
          return
        }
      }

      const quizzes = await prisma.quiz.findMany({
        where: { lessonId: parseInt(lessonId) },
        orderBy: { order: 'asc' },
        include: {
          questions: {
            orderBy: { id: 'asc' },
            include: {
              // Without an explicit order Postgres returns rows in whatever
              // order it likes (edited rows drift), which shuffled the prompts
              // within a question. Options are authored in id order.
              answerOptions: { orderBy: { id: 'asc' } },
              extraOptions: { orderBy: { id: 'asc' } },
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
