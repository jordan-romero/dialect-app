// GET  /api/teach/accept?token=… — preview a teacher invite (works signed out)
// POST /api/teach/accept { token } — accept it: become a teacher, get the class
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSessionUser } from '../../../../lib/rbac'
import {
  acceptTeacherInvite,
  InviteError,
  previewTeacherInvite,
} from '../../../../lib/teacherInvites'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const token = typeof req.query.token === 'string' ? req.query.token : ''
    const preview = token ? await previewTeacherInvite(token) : null
    if (!preview)
      return res.status(404).json({ error: 'This invite link is not valid.' })
    return res.status(200).json(preview)
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).end()
  }
  const { user, claims } = await getSessionUser(req, res)
  if (!user || !claims)
    return res.status(401).json({ error: 'Sign in to accept the invite.' })
  const token = typeof req.body?.token === 'string' ? req.body.token : ''
  if (!token) return res.status(400).json({ error: 'Missing invite.' })
  try {
    const r = await acceptTeacherInvite(user, claims, token)
    if (!r.ok) return res.status(r.status).json({ error: r.message })
    return res.status(200).json(r)
  } catch (e) {
    if (e instanceof InviteError)
      return res.status(e.status).json({ error: e.message })
    console.error('accept teacher invite failed:', e)
    return res.status(500).json({ error: 'Could not accept the invite.' })
  }
}
