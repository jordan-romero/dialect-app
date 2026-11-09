// DELETE /api/teach/cohorts/:id/members/:userId — remove a student from the
// class. Frees their seat; the teacher can no longer see their work. The
// student's own progress and answers are untouched.
import { prisma } from '../../../../../../lib/prisma'
import { withPermission } from '../../../../../../lib/rbac'
import { fillWaitingSeats, loadCohortFor } from '../../../../../../lib/cohorts'

export default withPermission('cohort:manage', async (req, res, { user }) => {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE'])
    return res.status(405).end()
  }
  const cohort = await loadCohortFor(user, Number(req.query.id))
  if (!cohort) return res.status(404).json({ error: 'Class not found' })
  const r = await prisma.cohortMember.updateMany({
    where: {
      cohortId: cohort.id,
      userId: Number(req.query.userId),
      removedAt: null,
    },
    data: { removedAt: new Date() },
  })
  if (r.count) await fillWaitingSeats(cohort.id)
  return r.count
    ? res.status(200).json({ ok: true })
    : res.status(404).json({ error: 'Student not found' })
})
