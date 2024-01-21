/* eslint-disable import/no-anonymous-default-export */
// pages/api/course.ts

import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Course } from '@prisma/client'

const prisma = new PrismaClient()

export default async (
  req: NextApiRequest,
  res: NextApiResponse<Course[] | { error: string }>,
) => {
  try {
    const freeCourses = await prisma.course.findMany({
      where: {
        price: null, // Assuming free courses have a null price, adjust as needed
      },
      include: {
        lessons: {
          include: {
            resources: true,
            quiz: true,
            discussions: true,
          },
        },
      },
    })

    if (freeCourses !== null) {
      // Course found, it's not null
      res.status(200).json(freeCourses)
    } else {
      // Course not found (null case)
      res.status(404).json({ error: 'Course not found.' })
    }
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ error: 'An error occurred while fetching the course.' })
  } finally {
    await prisma.$disconnect()
  }
}
