import { handleAuth, handleCallback, type Session } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { getOrCreateUser } from '../../../lib/user'

const prisma = new PrismaClient()

// Runs once per login. We stamp `firstTime` onto the SESSION (so it's stable for
// the whole logged-in session and resets on the next login — no mid-session
// flicker) and flip the persistent flag so every later login is a returning one.
const afterCallback = async (
  _req: NextApiRequest,
  _res: NextApiResponse,
  session: Session,
): Promise<Session> => {
  try {
    const user = await getOrCreateUser(prisma, session.user)
    if (user) {
      ;(session.user as Record<string, unknown>).firstTime =
        !user.hasSeenWelcome
      if (!user.hasSeenWelcome) {
        await prisma.user.update({
          where: { id: user.id },
          data: { hasSeenWelcome: true },
        })
      }
    }
  } catch (error) {
    console.error('afterCallback firstTime error:', error)
    ;(session.user as Record<string, unknown>).firstTime = false
  }
  return session
}

export default handleAuth({
  async callback(req, res) {
    try {
      await handleCallback(req, res, { afterCallback })
    } catch (error: any) {
      res.status(error.status || 500).end(error.message)
    }
  },
})
