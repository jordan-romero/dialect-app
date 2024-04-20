// pages/api/updateProgress.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { getSession } from '@auth0/nextjs-auth0'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' })
    }

    const { lessonId } = req.body

    if (!lessonId) {
      return res
        .status(400)
        .json({ message: 'Missing lessonId in request body' })
    }

    // Get the current user's session using Auth0
    const session = await getSession(req, res)

    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const userEmail = session.user.email

    // Find the lesson in the database
    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(lessonId) },
    })

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }

    // Check if a lesson progress record already exists for the user and lesson
    const existingLessonProgress = await prisma.lessonProgress.findFirst({
      where: {
        lessonId: Number(lessonId),
      },
    })

    const quiz = await prisma.quiz.findFirst({
      where: {
        lessonId: Number(lessonId),
      },
    })

    // Calculate the progress based on whether the lesson has a quiz or not
    const progress = quiz && quiz.hasBeenAttempted === false ? 50 : 100

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
              id: Number(lessonId),
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

    // Update the lesson's isCompleted field if progress reaches 100
    if (progress === 100) {
      console.log('Updating lesson isCompleted to true')
      try {
        await prisma.lesson.update({
          where: { id: Number(lessonId) },
          data: { isCompleted: true },
        })
        console.log('Lesson isCompleted updated successfully')
      } catch (error) {
        console.error('Error updating lesson isCompleted:', error)
      }
    }

    res.status(200).json({ message: 'Progress updated successfully' })
  } catch (error) {
    console.error('Error updating progress:', error)
    res.status(500).json({ message: 'Error updating progress' })
  } finally {
    await prisma.$disconnect() // Disconnect Prisma client after handling the request
  }
}
