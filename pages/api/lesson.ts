// pages/api/lesson/[id].ts
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid lesson ID' })
  }

  try {
    const lessonId = parseInt(id, 10)

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        resources: true,
        quiz: true,
      },
    })

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' })
    }

    console.log(`Successfully fetched lesson: ${JSON.stringify(lesson)}`)
    res.status(200).json(lesson)
  } catch (error) {
    console.error('Error fetching lesson:', error)
    res
      .status(500)
      .json({ error: 'An error occurred while fetching the lesson' })
  } finally {
    await prisma.$disconnect()
  }
}
