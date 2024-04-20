/* eslint-disable import/no-anonymous-default-export */
// pages/api/lesson.ts
import { NextApiRequest, NextApiResponse } from 'next'
import {
  PrismaClient,
  Course,
  Lesson,
  Quiz,
  Resource,
  Discussion,
} from '@prisma/client'

const prisma = new PrismaClient()

type LessonWithRelations = Lesson & {
  quiz: Quiz | null
  resources: Resource[]
  discussions: Discussion[]
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<LessonWithRelations[] | { error: string }>,
) => {
  try {
    const lessons = await prisma.lesson.findMany({
      include: {
        resources: true,
        quiz: true,
        discussions: true,
      },
      orderBy: {
        id: 'asc',
      },
    })

    console.log('Fetched lessons:', lessons)

    if (!lessons || lessons.length === 0) {
      console.log('No lessons found')
      return res.status(404).json({ error: 'No lessons found' })
    }

    res.status(200).json(lessons)
  } catch (error) {
    console.error('Error fetching lessons:', error)
    res
      .status(500)
      .json({ error: 'An error occurred while fetching the lessons.' })
  } finally {
    await prisma.$disconnect()
  }
}
