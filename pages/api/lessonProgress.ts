// pages/api/lessonProgress.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { getSession } from '@auth0/nextjs-auth0'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    try {
      // Get the current user's session using Auth0
      const session = await getSession(req, res)

      if (!session || !session.user) {
        res.status(401).json({ message: 'Unauthorized' })
        return
      }

      const userId = session.user.id

      // Retrieve the lesson progress data for the current user
      const lessonProgress = await prisma.lessonProgress.findMany({
        where: {
          userId,
        },
        select: {
          lessonId: true,
          progress: true,
        },
      })

      // Transform the lesson progress data into an object for easier lookup
      const lessonProgressMap = lessonProgress.reduce(
        (map: { [key: number]: number }, progress) => {
          map[progress.lessonId] = progress.progress
          return map
        },
        {},
      )

      res.status(200).json(lessonProgressMap)
    } catch (error) {
      console.error('Error retrieving lesson progress:', error)
      res.status(500).json({ message: 'Error retrieving lesson progress' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
