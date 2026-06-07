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

      res.status(200).json(await signDeep(courses))
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
