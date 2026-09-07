// Returns the "Repeat After Me" tongue-twister exercise data with its S3 audio
// URLs presigned (the bucket is private). Auth-gated like the other quiz APIs.
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@auth0/nextjs-auth0'
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { signDeep } from '../../lib/s3'
import { getLessonAccess } from '../../lib/access'

const prisma = new PrismaClient()

// Two lessons run this exercise off different content: 13a.C on Lesson 18 and
// 13b.A on Lesson 19. Both are quizType "repeatAfterMe", so the lesson is what
// distinguishes them. Whitelisted rather than interpolated — the lessonId
// arrives from the query string. Because the file served is keyed by this same
// id, gating on it is safe: the caller only ever receives the lesson they ask
// for, and both lessons are gated.
const BY_LESSON: Record<string, string> = {
  '18': 'repeatAfterMeData.json',
  '19': 'repeatAfterMe13bAData.json',
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession(req, res)
  if (!session?.user) return res.status(401).json({ error: 'Unauthorized' })

  const lessonKey = String(req.query.lessonId ?? '18')
  const file = BY_LESSON[lessonKey]
  if (!file) return res.status(404).json({ error: 'No such exercise' })

  try {
    const access = await getLessonAccess(
      prisma,
      session.user.email,
      Number(lessonKey),
    )
    if (!access.ok) {
      return res.status(access.status).json({ error: access.message })
    }

    const filePath = join(process.cwd(), 'data', file)
    const data = JSON.parse(readFileSync(filePath, 'utf-8'))
    // signDeep recursively presigns any of our S3 URLs (the audio clips).
    return res.status(200).json(await signDeep(data))
  } catch (error) {
    console.error('Error loading repeat-after-me data:', error)
    return res.status(500).json({ error: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}
