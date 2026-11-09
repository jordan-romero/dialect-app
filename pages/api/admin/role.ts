// POST /api/admin/role { email, role } — admins only. Sets a user's role.
import { prisma } from '../../../lib/prisma'
import { withPermission, type RoleName } from '../../../lib/rbac'

const ROLES: RoleName[] = ['STUDENT', 'TEACHER', 'ADMIN']

export default withPermission('user:assignRole', async (req, res, { user }) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end()
  }
  const email = String(req.body?.email || '')
    .trim()
    .toLowerCase()
  const role = String(req.body?.role || '') as RoleName
  if (!email || !ROLES.includes(role))
    return res.status(400).json({ error: 'Need email and a valid role.' })
  const target = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
  })
  if (!target)
    return res
      .status(404)
      .json({
        error: 'No user with that email (they must sign in once first).',
      })
  if (target.id === user.id && role !== 'ADMIN') {
    return res
      .status(400)
      .json({ error: "You can't remove your own admin role." })
  }
  await prisma.user.update({ where: { id: target.id }, data: { role } })
  return res.status(200).json({ email: target.email, role })
})
