// Lightweight "who am I" endpoint for the client: whether the signed-in user
// is an admin (ADMIN_EMAILS) and whether they have paid access.
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@auth0/nextjs-auth0'
import { PrismaClient } from '@prisma/client'
import { isAllowlisted, hasPaidAccess } from '../../lib/access'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession(req, res)
  const email = session?.user?.email
  if (!email) return res.status(401).json({ message: 'Unauthorized' })
  res.status(200).json({
    email,
    isAdmin: isAllowlisted(email),
    hasAccess: await hasPaidAccess(prisma, email),
  })
}
