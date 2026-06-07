// Library data: every resource grouped by phase -> lesson. A phase unlocks the
// same way its lessons do (the previous phase must be complete); paid-gated
// lessons stay locked without access. URLs are presigned only when accessible.
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { getSession } from '@auth0/nextjs-auth0'
import { signDeep } from '../../lib/s3'
import { hasPaidAccess, getUnlockedCourseIds } from '../../lib/access'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const session = await getSession(req, res)
  if (!session?.user) return res.status(401).json({ message: 'Unauthorized' })

  try {
    const courses = await prisma.course.findMany({
      include: {
        lessons: {
          include: { resources: { orderBy: { order: 'asc' } } },
          orderBy: { id: 'asc' },
        },
      },
      orderBy: { id: 'asc' },
    })

    const email = session.user.email
    const paid = await hasPaidAccess(prisma, email)
    const unlocked = await getUnlockedCourseIds(prisma, email)

    const phases = courses.map((c: any) => {
      const phaseUnlocked = unlocked.has(c.id)
      const lessons = (c.lessons || [])
        .filter((l: any) => (l.resources || []).length > 0)
        .map((l: any) => {
          const paidLocked = !paid && l.isGatedLesson
          const locked = !phaseUnlocked || paidLocked
          const lockReason = !phaseUnlocked
            ? 'phase'
            : paidLocked
            ? 'paid'
            : null
          return {
            id: l.id,
            title: l.title,
            displayOrder: l.displayOrder,
            locked,
            lockReason,
            resources: (l.resources || []).map((r: any) => ({
              id: r.id,
              name: r.name,
              type: r.type,
              order: r.order,
              // Only expose (and presign) the URL when the learner can access it.
              url: locked ? null : r.url,
            })),
          }
        })
      return {
        id: c.id,
        title: c.title,
        unlocked: phaseUnlocked,
        lessons,
      }
    })

    return res.status(200).json(await signDeep(phases))
  } catch (error) {
    console.error('Error fetching library:', error)
    return res.status(500).json({ message: 'Error fetching library' })
  } finally {
    await prisma.$disconnect()
  }
}
