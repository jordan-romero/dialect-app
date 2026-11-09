// GET   /api/teach/cohorts/:id — cohort, seats, roster with progress, invites
// PATCH /api/teach/cohorts/:id — edit name/institution/dates, turn the join
//        code on or off, rotate it, archive or unarchive
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Cohort } from '@prisma/client'
import { prisma } from '../../../../../lib/prisma'
import { withPermission } from '../../../../../lib/rbac'
import {
  appOrigin,
  cohortIsOpen,
  formatJoinCode,
  loadCohortFor,
  seatsUsed,
  uniqueJoinCode,
} from '../../../../../lib/cohorts'
import { cohortRoster } from '../../../../../lib/roster'
import { SEAT_TIERS } from '../../../../../lib/pricing'

export default withPermission('cohort:manage', async (req, res, { user }) => {
  const cohort = await loadCohortFor(user, Number(req.query.id))
  if (!cohort) return res.status(404).json({ error: 'Class not found' })
  if (req.method === 'GET') return get(req, res, cohort)
  if (req.method === 'PATCH') return patch(req, res, cohort)
  res.setHeader('Allow', ['GET', 'PATCH'])
  return res.status(405).end()
})

async function get(req: NextApiRequest, res: NextApiResponse, cohort: Cohort) {
  const origin = appOrigin(req)
  const [used, roster, invites, purchases, teacher] = await Promise.all([
    seatsUsed(cohort.id),
    cohortRoster(cohort.id),
    prisma.cohortInvite.findMany({
      where: { cohortId: cohort.id, revokedAt: null },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.purchase.findMany({
      where: { cohortId: cohort.id, kind: 'SEATS' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        quantity: true,
        amountTotal: true,
        amountRefunded: true,
        currency: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: cohort.teacherId },
      select: { email: true, firstName: true, lastName: true },
    }),
  ])
  return res.status(200).json({
    cohort: {
      id: cohort.id,
      name: cohort.name,
      institution: cohort.institution,
      paymentMode: cohort.paymentMode,
      seatCount: cohort.seatCount,
      seatsUsed: used,
      joinCode: formatJoinCode(cohort.joinCode),
      joinEnabled: cohort.joinEnabled,
      joinUrl: `${origin}/join/${cohort.joinCode}`,
      startsAt: cohort.startsAt,
      endsAt: cohort.endsAt,
      archivedAt: cohort.archivedAt,
      open: cohortIsOpen(cohort),
      teacher,
    },
    roster,
    invites: invites.map((i) => ({
      id: i.id,
      email: i.email,
      url: `${origin}/join/invite/${i.token}`,
      createdAt: i.createdAt,
      acceptedAt: i.acceptedAt,
    })),
    purchases,
    seatTiers: SEAT_TIERS,
  })
}

async function patch(
  req: NextApiRequest,
  res: NextApiResponse,
  cohort: Cohort,
) {
  const b = req.body || {}
  const data: Record<string, unknown> = {}
  if (typeof b.name === 'string') {
    const name = b.name.trim()
    if (!name || name.length > 120)
      return res.status(400).json({ error: 'Invalid name.' })
    data.name = name
  }
  if (typeof b.institution === 'string')
    data.institution = b.institution.trim().slice(0, 160) || null
  if (typeof b.joinEnabled === 'boolean') data.joinEnabled = b.joinEnabled
  if (b.rotateJoinCode === true) data.joinCode = await uniqueJoinCode()
  if (typeof b.archived === 'boolean')
    data.archivedAt = b.archived ? new Date() : null
  if (b.endsAt !== undefined) {
    const d = b.endsAt ? new Date(b.endsAt) : null
    if (d && isNaN(d.getTime()))
      return res.status(400).json({ error: 'Invalid end date.' })
    if (!d && cohort.paymentMode === 'SEATS') {
      return res
        .status(400)
        .json({ error: 'Seat-package classes need an end date.' })
    }
    data.endsAt = d
  }
  const updated = await prisma.cohort.update({ where: { id: cohort.id }, data })
  return res
    .status(200)
    .json({ id: updated.id, joinCode: formatJoinCode(updated.joinCode) })
}
