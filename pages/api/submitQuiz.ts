import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const { quizId, userId, answers } = req.body

    if (!quizId || !userId || !answers) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    })

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' })
    }

    // Handle short answer submissions
    if (quiz.quizType === 'shortAnswer') {
      for (const [questionId, answer] of Object.entries(answers)) {
        await prisma.userAnswer.create({
          data: {
            quizId,
            questionId: parseInt(questionId),
            userId,
            textAnswer: answer as string,
          },
        })
      }
    }

    // Mark the quiz as completed
    const updatedQuiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        isCompleted: true,
        hasBeenAttempted: true,
      },
    })

    // Update LessonProgress
    const lessonProgress = await prisma.lessonProgress.findFirst({
      where: {
        lessonId: quiz.lessonId,
        userId,
      },
    })

    if (lessonProgress) {
      await prisma.lessonProgress.update({
        where: { id: lessonProgress.id },
        data: {
          hasQuizBeenCompleted: true,
        },
      })
    }

    res.status(200).json({
      message: 'Quiz submitted successfully',
      quiz: updatedQuiz,
    })
  } catch (error) {
    console.error('Error submitting quiz:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  } finally {
    await prisma.$disconnect()
  }
}
