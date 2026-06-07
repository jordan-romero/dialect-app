// Read/update the signed-in user's profile (name, avatar, blurb, interests).
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@auth0/nextjs-auth0'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession(req, res)
  if (!session?.user) return res.status(401).json({ error: 'Unauthorized' })

  const auth0Id = session.user.sub as string
  const email = session.user.email as string

  try {
    if (req.method === 'GET') {
      const user = await prisma.user.findUnique({ where: { auth0Id } })
      return res.status(200).json({
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        avatar: user?.avatar ?? '',
        bio: user?.bio ?? '',
        interests: user?.interests ?? [],
        email,
        // Fall back to the Auth0 picture if no custom avatar is set.
        authPicture: (session.user.picture as string) ?? '',
      })
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const { firstName, lastName, avatar, bio, interests } = req.body ?? {}
      // Avatars are client-resized data URLs; guard against oversized payloads.
      if (typeof avatar === 'string' && avatar.length > 1_500_000) {
        return res.status(413).json({ error: 'Image too large' })
      }
      const data = {
        firstName: typeof firstName === 'string' ? firstName.trim() : undefined,
        lastName: typeof lastName === 'string' ? lastName.trim() : undefined,
        avatar: typeof avatar === 'string' ? avatar.trim() : undefined,
        bio: typeof bio === 'string' ? bio.trim() : undefined,
        interests: Array.isArray(interests)
          ? interests.filter((x: unknown) => typeof x === 'string').slice(0, 30)
          : undefined,
      }
      const user = await prisma.user.upsert({
        where: { auth0Id },
        update: data,
        create: { auth0Id, email, ...data },
      })
      return res.status(200).json({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        avatar: user.avatar ?? '',
        bio: user.bio ?? '',
        interests: user.interests ?? [],
      })
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  } catch (error) {
    console.error('Profile API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
