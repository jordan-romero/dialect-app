// GET  /api/admin/teacher-invites — every invite, newest first
// POST /api/admin/teacher-invites — invite a teacher with N seats and send the
//      Stripe invoice to the billing contact
import { prisma } from '../../../../lib/prisma'
import { withPermission } from '../../../../lib/rbac'
import { siteUrl } from '../../../../lib/siteUrl'
import { SEAT_TIERS } from '../../../../lib/pricing'
import {
  adminInclude,
  adminRow,
  createTeacherInvite,
  InviteError,
} from '../../../../lib/teacherInvites'

export default withPermission('teacher:invite', async (req, res, { user }) => {
  const base = siteUrl(req)
  if (req.method === 'GET') {
    const invites = await prisma.teacherInvite.findMany({
      include: adminInclude,
      orderBy: { createdAt: 'desc' },
    })
    return res.status(200).json({
      invites: invites.map((i) => adminRow(i, base)),
      seatTiers: SEAT_TIERS,
    })
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).end()
  }
  try {
    const invite = await createTeacherInvite(user, req.body || {})
    const full = await prisma.teacherInvite.findUniqueOrThrow({
      where: { id: invite.id },
      include: adminInclude,
    })
    return res.status(201).json({ invite: adminRow(full, base) })
  } catch (e) {
    if (e instanceof InviteError)
      return res.status(e.status).json({ error: e.message })
    throw e
  }
})
