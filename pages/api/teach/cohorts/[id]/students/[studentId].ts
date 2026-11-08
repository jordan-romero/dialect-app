// GET /api/teach/cohorts/:id/students/:studentId — one student's work: every
// lesson and exercise, with what they entered next to the expected answer.
// Only for a current member of a cohort the caller manages.
import { withPermission } from '../../../../../../lib/rbac'
import { loadCohortFor, loadStudentInCohort } from '../../../../../../lib/cohorts'
import { studentWork } from '../../../../../../lib/studentWork'

export default withPermission('cohort:manage', async (req, res, { user }) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end()
  }
  const cohort = await loadCohortFor(user, Number(req.query.id))
  if (!cohort) return res.status(404).json({ error: 'Class not found' })
  const member = await loadStudentInCohort(cohort.id, Number(req.query.studentId))
  if (!member) return res.status(404).json({ error: 'Student not found in this class' })
  const lessons = await studentWork(member.userId)
  return res.status(200).json({
    cohort: { id: cohort.id, name: cohort.name },
    student: { ...member.user, joinedAt: member.joinedAt, usesSeat: member.usesSeat },
    lessons,
  })
})
