// POST   /api/teach/cohorts/:id/invites  { emails: string[] | string }
//        Creates one invite link per email (re-inviting returns the existing
//        link). No email is sent yet; the teacher copies the links.
// DELETE /api/teach/cohorts/:id/invites?inviteId=…  revoke a pending invite
import { prisma } from '../../../../../lib/prisma'
import { withPermission } from '../../../../../lib/rbac'
import {
  appOrigin,
  generateInviteToken,
  isEmail,
  loadCohortFor,
  normalizeEmail,
} from '../../../../../lib/cohorts'

const MAX_PER_REQUEST = 300

export default withPermission('cohort:manage', async (req, res, { user }) => {
  const cohort = await loadCohortFor(user, Number(req.query.id))
  if (!cohort) return res.status(404).json({ error: 'Class not found' })

  if (req.method === 'DELETE') {
    const inviteId = Number(req.query.inviteId)
    const r = await prisma.cohortInvite.updateMany({
      where: {
        id: inviteId,
        cohortId: cohort.id,
        acceptedAt: null,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    })
    return r.count
      ? res.status(200).json({ ok: true })
      : res.status(404).json({ error: 'Invite not found' })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST', 'DELETE'])
    return res.status(405).end()
  }

  const raw = req.body?.emails
  const list: string[] = Array.isArray(raw)
    ? raw.map(String)
    : typeof raw === 'string'
    ? raw.split(/[\s,;]+/)
    : []
  const emails = Array.from(new Set(list.map(normalizeEmail).filter(Boolean)))
  const invalid = emails.filter((e) => !isEmail(e))
  const valid = emails.filter(isEmail)
  if (valid.length === 0)
    return res.status(400).json({ error: 'No valid email addresses.', invalid })
  if (valid.length > MAX_PER_REQUEST) {
    return res
      .status(400)
      .json({ error: `Up to ${MAX_PER_REQUEST} emails at a time.` })
  }

  const origin = appOrigin(req)
  const results = []
  for (const email of valid) {
    const existing = await prisma.cohortInvite.findUnique({
      where: { cohortId_email: { cohortId: cohort.id, email } },
    })
    const invite = existing
      ? existing.revokedAt
        ? await prisma.cohortInvite.update({
            where: { id: existing.id },
            data: {
              revokedAt: null,
              token: generateInviteToken(),
              createdAt: new Date(),
            },
          })
        : existing
      : await prisma.cohortInvite.create({
          data: { cohortId: cohort.id, email, token: generateInviteToken() },
        })
    results.push({
      id: invite.id,
      email,
      url: `${origin}/join/invite/${invite.token}`,
      acceptedAt: invite.acceptedAt,
    })
  }
  return res.status(200).json({ invites: results, invalid })
})
