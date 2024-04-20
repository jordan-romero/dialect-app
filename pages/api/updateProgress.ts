// pages/api/updateProgress.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { getSession } from '@auth0/nextjs-auth0'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const { lessonId } = req.body

    try {
      // Get the current user's session using Auth0
      const session = await getSession(req, res)

      if (!session || !session.user) {
        res.status(401).json({ message: 'Unauthorized' })
        return
      }

      const userEmail = session.user.email

      console.log(userEmail, session.user, 'USER INFO')

      // Find the lesson in the database
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
      })

      if (!lesson) {
        res.status(404).json({ message: 'Lesson not found' })
        return
      }

      // Check if a quiz exists for the lesson
      const quiz = await prisma.quiz.findFirst({
        where: { lessonId },
      })

      // Calculate the progress based on whether the lesson has a quiz or not
      const progress = quiz ? 50 : 100

      // Check if a lesson progress record already exists for the user and lesson
      const existingLessonProgress = await prisma.lessonProgress.findFirst({
        where: {
          lessonId,
        },
      })

      if (existingLessonProgress) {
        // Update the existing lesson progress record
        await prisma.lessonProgress.update({
          where: {
            id: existingLessonProgress.id,
          },
          data: {
            progress,
            updatedAt: new Date(),
          },
        })
      } else {
        // Create a new lesson progress record
        await prisma.lessonProgress.create({
          data: {
            lesson: {
              connect: {
                id: lessonId,
              },
            },
            user: {
              connect: {
                email: userEmail,
              },
            },
            progress,
            updatedAt: new Date(),
          },
        })
      }

      // Update the lesson's isCompleted field if progress reaches 100
      if (progress === 100) {
        await prisma.lesson.update({
          where: { id: lessonId },
          data: { isCompleted: true },
        })
      }

      res.status(200).json({ message: 'Progress updated successfully' })
    } catch (error) {
      console.error('Error updating progress:', error)
      res.status(500).json({ message: 'Error updating progress' })
    }
  }
}
