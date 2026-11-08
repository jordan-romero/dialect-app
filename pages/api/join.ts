// GET  /api/join?code=K7F3QX | ?token=…  — preview a class before joining
//      (works signed out, so the join page can show the class name)
// POST /api/join { code } | { token }    — join it (signed in)
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'
import { getSessionUser } from '../../lib/rbac'
import { cohortIsOpen, joinCohort, normalizeJoinCode } from '../../lib/cohorts'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return preview(req, res)
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).end()
  }
  const { user, claims } = await getSessionUser(req, res)
  if (!user || !claims) return res.status(401).json({ error: 'Sign in to join a class.' })
  const { code, token } = req.body || {}
  const target =
    typeof token === 'string' && token
      ? { token }
      : typeof code === 'string' && code
      ? { code }
      : null
  if (!target) return res.status(400).json({ error: 'Missing class code.' })
  const result = await joinCohort(user, claims, target)
  if (!result.ok) return res.status(result.status).json({ error: result.message, code: result.code })
  return res.status(200).json(result)
}

async function preview(req: NextApiRequest, res: NextApiResponse) {
  const token = typeof req.query.token === 'string' ? req.query.token : null
  const code = typeof req.query.code === 'string' ? normalizeJoinCode(req.query.code) : null
  let cohort = null
  let inviteEmail: string | null = null
  if (token) {
    const invite = await prisma.cohortInvite.findUnique({
      where: { token },
      include: { cohort: true },
    })
    if (invite && !invite.revokedAt) {
      cohort = invite.cohort
      inviteEmail = invite.email
    }
  } else if (code) {
    const c = await prisma.cohort.findUnique({ where: { joinCode: code } })
    if (c?.joinEnabled) cohort = c
  }
  if (!cohort) return res.status(404).json({ error: 'That class link is not valid.' })
  const teacher = await prisma.user.findUnique({
    where: { id: cohort.teacherId },
    select: { firstName: true, lastName: true },
  })
  return res.status(200).json({
    name: cohort.name,
    institution: cohort.institution,
    teacherName: [teacher?.firstName, teacher?.lastName].filter(Boolean).join(' ') || null,
    paymentMode: cohort.paymentMode,
    open: cohortIsOpen(cohort),
    endsAt: cohort.endsAt,
    inviteEmail,
  })
}
