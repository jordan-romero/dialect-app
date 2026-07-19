// pages/api/lesson/[id].ts
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { getSession } from '@auth0/nextjs-auth0'
import { signDeep } from '../../lib/s3'
import {
  hasPaidAccess,
  gateLessonFull,
  getUnlockedCourseIds,
} from '../../lib/access'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession(req, res)
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { id } = req.query

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid lesson ID' })
  }

  try {
    const lessonId = parseInt(id, 10)

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        resources: {
          orderBy: {
            order: 'asc',
          },
        },
        quiz: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' })
    }

    const email = session.user.email
    const paid = await hasPaidAccess(prisma, email)
    const unlockedCourses = await getUnlockedCourseIds(prisma, email)
    res.status(200).json(
      await signDeep(
        gateLessonFull(lesson, {
          paidAccess: paid,
          phaseUnlocked: unlockedCourses.has((lesson as any).courseId),
        }),
      ),
    )
  } catch (error) {
    console.error('Error fetching lesson:', error)
    res
      .status(500)
      .json({ error: 'An error occurred while fetching the lesson' })
  } finally {
    await prisma.$disconnect()
  }
}
