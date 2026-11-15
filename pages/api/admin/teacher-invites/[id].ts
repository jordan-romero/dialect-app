// POST /api/admin/teacher-invites/:id { action }
//   markPaid    — paid outside Stripe (check, PO); closes the Stripe invoice
//                 and emails the teacher
//   void        — cancel an unpaid invite and its invoice
//   resendEmail — email the teacher's accept link again (paid invites)
import { prisma } from '../../../../lib/prisma'
import { withPermission } from '../../../../lib/rbac'
import { siteUrl } from '../../../../lib/siteUrl'
import {
  adminInclude,
  adminRow,
  emailTeacherInvite,
  InviteError,
  markInvitePaid,
  voidInvite,
} from '../../../../lib/teacherInvites'

export default withPermission('teacher:invite', async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end()
  }
  const id = Number(req.query.id)
  const base = siteUrl(req)
  const invite = Number.isInteger(id)
    ? await prisma.teacherInvite.findUnique({ where: { id } })
    : null
  if (!invite) return res.status(404).json({ error: 'Invite not found' })
  const action = req.body?.action
  let email: { sent: boolean; error?: string } | null = null
  try {
    if (action === 'markPaid') {
      if (invite.status !== 'INVOICED')
        return res.status(409).json({ error: 'This invite is already paid.' })
      await markInvitePaid(id, { manual: true, baseUrl: base })
    } else if (action === 'void') {
      await voidInvite(id)
    } else if (action === 'resendEmail') {
      if (invite.status !== 'PAID')
        return res
          .status(409)
          .json({
            error: 'Only paid, not-yet-accepted invites can be emailed.',
          })
      email = await emailTeacherInvite(invite, base)
    } else {
      return res.status(400).json({ error: 'Unknown action' })
    }
  } catch (e) {
    if (e instanceof InviteError)
      return res.status(e.status).json({ error: e.message })
    throw e
  }
  const full = await prisma.teacherInvite.findUniqueOrThrow({
    where: { id },
    include: adminInclude,
  })
  return res.status(200).json({ invite: adminRow(full, base), email })
})
