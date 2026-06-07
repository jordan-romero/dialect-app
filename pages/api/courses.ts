// // pages/api/courses.ts

// import type { NextApiRequest, NextApiResponse } from 'next'
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse,
// ) {
//   if (req.method === 'GET') {
//     try {
//       const courses = await prisma.course.findMany({
//         include: {
//           lessons: true,
//         },
//       })

//       res.status(200).json(courses)
//     } catch (error) {
//       res.status(500).json({ message: 'Error fetching courses', error })
//     }
//   } else {
//     res.setHeader('Allow', ['GET'])
//     res.status(405).end(`Method ${req.method} Not Allowed`)
//   }
// }
// pages/api/courses.ts

import type { NextApiRequest, NextApiResponse } from 'next'
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
  if (req.method === 'GET') {
    const session = await getSession(req, res)
    if (!session?.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    try {
      const courses = await prisma.course.findMany({
        include: {
          lessons: {
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
            orderBy: {
              id: 'asc',
            },
          },
        },
        orderBy: {
          id: 'asc',
        },
      })

      const email = session.user.email
      const paid = await hasPaidAccess(prisma, email)
      const unlockedCourses = await getUnlockedCourseIds(prisma, email)
      const gated = courses.map((c: any) => {
        const phaseUnlocked = unlockedCourses.has(c.id)
        return {
          ...c,
          unlocked: phaseUnlocked,
          lessons: (c.lessons || []).map((l: any) =>
            gateLessonFull(l, { paidAccess: paid, phaseUnlocked }),
          ),
        }
      })
      res.status(200).json(await signDeep(gated))
    } catch (error) {
      console.error('Error fetching courses:', error)
      res.status(500).json({ message: 'Error fetching courses', error })
    } finally {
      await prisma.$disconnect()
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
