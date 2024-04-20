/* eslint-disable import/no-anonymous-default-export */
// pages/api/lesson.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Course } from '@prisma/client'

const prisma = new PrismaClient()

export default async (
  req: NextApiRequest,
  res: NextApiResponse<Course[] | { error: string }>,
) => {
  if (req.method === 'GET') {
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

      res.status(200).json(lessons as any)
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: 'An error occurred while fetching the lessons.' })
    } finally {
      await prisma.$disconnect()
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }
}
