/* eslint-disable import/no-anonymous-default-export */
// pages/api/course.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Course } from '@prisma/client'

const prisma = new PrismaClient()

export default async (
  req: NextApiRequest,
  res: NextApiResponse<Course[] | { error: string }>,
) => {
  if (req.method === 'GET') {
    try {
      const courses = await prisma.course.findMany({
        include: {
          lessons: {
            include: {
              resources: true,
              quiz: true,
              discussions: true,
            },
          },
        },
        orderBy: {
          id: 'asc',
        },
      })

      res.status(200).json(courses)
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: 'An error occurred while fetching the courses.' })
    } finally {
      await prisma.$disconnect()
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }
}
