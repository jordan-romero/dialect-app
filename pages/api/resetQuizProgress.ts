// Clears the signed-in user's saved answers for a single quiz, so they can
// retake it ("Try again"). Completion is derived from saved answers, so
// deleting them resets the quiz to not-started.
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@auth0/nextjs-auth0'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const session = await getSession(req, res)
  if (!session?.user) return res.status(401).json({ error: 'Unauthorized' })

  const { quizId } = req.body
  if (!quizId) return res.status(400).json({ error: 'Missing quizId' })

  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
    })
    if (!user) return res.status(404).json({ error: 'User not found' })

    await prisma.userAnswer.deleteMany({
      where: { userId: user.id, quizId: Number(quizId) },
    })
    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Error resetting quiz progress:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
