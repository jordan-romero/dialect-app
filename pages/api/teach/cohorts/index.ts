// GET  /api/teach/cohorts  — cohorts I teach (admins: ?all=1 for every cohort)
// POST /api/teach/cohorts  — create a cohort
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'
import { can, withPermission } from '../../../../lib/rbac'
import {
  cohortIsOpen,
  formatJoinCode,
  uniqueJoinCode,
} from '../../../../lib/cohorts'

export default withPermission('cohort:manage', async (req, res, { user }) => {
  if (req.method === 'GET')
    return list(req, res, user.id, can(user, 'cohort:manageAny'))
  if (req.method === 'POST') return create(req, res, user.id)
  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).end()
})

async function list(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
  isAdmin: boolean,
) {
  const all = isAdmin && req.query.all === '1'
  const cohorts = await prisma.cohort.findMany({
    where: all ? {} : { teacherId: userId },
    orderBy: [
      { archivedAt: { sort: 'desc', nulls: 'first' } },
      { createdAt: 'desc' },
    ],
    include: {
      teacher: { select: { email: true, firstName: true, lastName: true } },
      _count: { select: { members: { where: { removedAt: null } } } },
    },
  })
  const seatCounts = await prisma.cohortMember.groupBy({
    by: ['cohortId'],
    where: {
      cohortId: { in: cohorts.map((c) => c.id) },
      usesSeat: true,
      removedAt: null,
    },
    _count: { _all: true },
  })
  const used = new Map(seatCounts.map((s) => [s.cohortId, s._count._all]))
  return res.status(200).json({
    cohorts: cohorts.map((c) => ({
      id: c.id,
      name: c.name,
      institution: c.institution,
      paymentMode: c.paymentMode,
      seatCount: c.seatCount,
      seatsUsed: used.get(c.id) || 0,
      students: c._count.members,
      joinCode: formatJoinCode(c.joinCode),
      startsAt: c.startsAt,
      endsAt: c.endsAt,
      archivedAt: c.archivedAt,
      open: cohortIsOpen(c),
      teacher: c.teacher,
      createdAt: c.createdAt,
    })),
  })
}

function parseDate(v: unknown): Date | null | 'invalid' {
  if (v === undefined || v === null || v === '') return null
  const d = new Date(String(v))
  return isNaN(d.getTime()) ? 'invalid' : d
}

async function create(
  req: NextApiRequest,
  res: NextApiResponse,
  teacherId: number,
) {
  const body = req.body || {}
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name || name.length > 120) {
    return res
      .status(400)
      .json({ error: 'Give the class a name (up to 120 characters).' })
  }
  const paymentMode =
    body.paymentMode === 'SEATS'
      ? 'SEATS'
      : body.paymentMode === 'SELF_PAY'
      ? 'SELF_PAY'
      : null
  if (!paymentMode)
    return res.status(400).json({ error: 'Choose how students pay.' })
  const startsAt = parseDate(body.startsAt)
  const endsAt = parseDate(body.endsAt)
  if (startsAt === 'invalid' || endsAt === 'invalid') {
    return res.status(400).json({ error: 'Invalid date.' })
  }
  // Seats end at the cohort's end date, so a seat cohort needs one.
  if (paymentMode === 'SEATS' && !endsAt) {
    return res
      .status(400)
      .json({ error: 'Seat-package classes need an end date; seats end then.' })
  }
  if (endsAt && endsAt <= new Date()) {
    return res
      .status(400)
      .json({ error: 'The end date must be in the future.' })
  }
  if (startsAt && endsAt && endsAt <= startsAt) {
    return res
      .status(400)
      .json({ error: 'The end date must be after the start date.' })
  }
  const institution =
    typeof body.institution === 'string' && body.institution.trim()
      ? body.institution.trim().slice(0, 160)
      : null

  const cohort = await prisma.cohort.create({
    data: {
      name,
      institution,
      paymentMode,
      teacherId,
      startsAt,
      endsAt,
      joinCode: await uniqueJoinCode(),
    },
  })
  return res.status(201).json({ id: cohort.id })
}
