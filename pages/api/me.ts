// Lightweight "who am I" endpoint for the client: whether the signed-in user
// is an admin (ADMIN_EMAILS, for test-card hints), whether they have paid
// access and where it comes from, and their role and permissions (drives the
// "Teach" nav item).
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@auth0/nextjs-auth0'
import { prisma } from '../../lib/prisma'
import { isAllowlisted, getAccessInfo } from '../../lib/access'
import { permissionsFor } from '../../lib/rbac'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession(req, res)
  const email = session?.user?.email
  if (!email) return res.status(401).json({ message: 'Unauthorized' })
  const access = await getAccessInfo(prisma, session.user)
  const role = access.role ?? 'STUDENT'
  res.status(200).json({
    email,
    isAdmin: isAllowlisted(email),
    hasAccess: access.paid,
    accessSource: access.source,
    role,
    permissions: permissionsFor(role),
  })
}
