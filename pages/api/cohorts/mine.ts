// GET  /api/cohorts/mine                  — classes I'm a student in
// POST /api/cohorts/mine { leaveCohortId } — leave a class (the teacher loses
//      access to my work; my progress stays mine)
import { prisma } from '../../../lib/prisma'
import { withPermission } from '../../../lib/rbac'
import { cohortIsOpen } from '../../../lib/cohorts'

export default withPermission(null, async (req, res, { user }) => {
  if (req.method === 'POST') {
    const id = Number(req.body?.leaveCohortId)
    const r = await prisma.cohortMember.updateMany({
      where: { cohortId: id, userId: user.id, removedAt: null },
      data: { removedAt: new Date() },
    })
    return r.count
      ? res.status(200).json({ ok: true })
      : res.status(404).json({ error: 'Not in that class' })
  }
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).end()
  }
  const rows = await prisma.cohortMember.findMany({
    where: { userId: user.id, removedAt: null },
    include: {
      cohort: {
        include: {
          teacher: { select: { firstName: true, lastName: true, email: true } },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  })
  return res.status(200).json({
    cohorts: rows.map((m) => ({
      id: m.cohort.id,
      name: m.cohort.name,
      institution: m.cohort.institution,
      teacher: m.cohort.teacher,
      paymentMode: m.cohort.paymentMode,
      usesSeat: m.usesSeat,
      endsAt: m.cohort.endsAt,
      open: cohortIsOpen(m.cohort),
      joinedAt: m.joinedAt,
    })),
  })
})
