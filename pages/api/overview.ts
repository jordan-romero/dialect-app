// Dashboard overview: current lesson, progress, streak, and badges.
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { getSession } from '@auth0/nextjs-auth0'
import { computeOverview } from '../../lib/overview'
import { getOrCreateUser } from '../../lib/user'

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
  if (!session?.user) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const user = await getOrCreateUser(prisma, session.user)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    // `firstTime` is stamped on the session at login (see the Auth0 callback),
    // so it's stable for the whole session and resets on the next login.
    const firstTime = !!(session.user as Record<string, unknown>).firstTime

    const overview = await computeOverview(
      prisma,
      user,
      session.user.email as string,
    )
    return res.status(200).json({ ...overview, firstTime })
  } catch (error) {
    console.error('Overview API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}
