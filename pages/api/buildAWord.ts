// Returns the Checkpoint 1 "Build-a-Word" data with its S3 audio URLs
// presigned (the bucket is private). Auth-gated like the other quiz APIs.
//
// Mirrors pages/api/repeatAfterMe.ts. The data moved out of public/ for this
// reason: files there are served straight off disk, so the clip URLs would
// reach the browser unsigned and 403.
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@auth0/nextjs-auth0'
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { signDeep } from '../../lib/s3'
import { getLessonAccess } from '../../lib/access'

const prisma = new PrismaClient()

// This exercise belongs to Checkpoint 1 (Lesson 25), a gated lesson. The gate
// keys off that fixed id — never a client-supplied one — since the file served
// here is always Checkpoint 1's content.
const LESSON_ID = 25

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession(req, res)
  if (!session?.user) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const access = await getLessonAccess(prisma, session.user.email, LESSON_ID)
    if (!access.ok) {
      return res.status(access.status).json({ error: access.message })
    }

    const filePath = join(process.cwd(), 'data', 'buildAWordData.json')
    const data = JSON.parse(readFileSync(filePath, 'utf-8'))
    return res.status(200).json(await signDeep(data))
  } catch (error) {
    console.error('Error loading build-a-word data:', error)
    return res.status(500).json({ error: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}
