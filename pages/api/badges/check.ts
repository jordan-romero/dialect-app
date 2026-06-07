// Computes the user's currently-earned badges, persists any newly-earned ones,
// and returns just the NEW ones so the client can celebrate them once.
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { getSession } from '@auth0/nextjs-auth0'
import { computeOverview } from '../../../lib/overview'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const session = await getSession(req, res)
  if (!session?.user) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub as string },
    })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const { badges } = await computeOverview(
      prisma,
      user,
      session.user.email as string,
    )

    const earnedIds = badges.filter((b) => b.earned).map((b) => b.id)
    const already = new Set(user.badges || [])
    const newlyEarned = badges.filter((b) => b.earned && !already.has(b.id))

    if (newlyEarned.length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { badges: earnedIds },
      })
    }

    return res.status(200).json({
      newlyEarned: newlyEarned.map((b) => ({
        id: b.id,
        label: b.label,
        hint: b.hint,
      })),
    })
  } catch (error) {
    console.error('Badge check error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}
