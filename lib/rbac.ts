// Role-based access control.
//
// Roles live on User.role and are read from the database on every request, so
// a role change takes effect immediately. What each role may do is defined
// ONLY here; routes ask `can(user, permission)` rather than checking roles.
//
// Role checks answer "may this kind of user do X at all". Which records they
// may do it to (their own cohorts, students in those cohorts) is a separate
// resource check — see lib/cohorts.ts (`loadCohortFor`, `loadStudentFor`).
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@auth0/nextjs-auth0'
import type { User } from '@prisma/client'
import { prisma } from './prisma'

export type RoleName = 'STUDENT' | 'TEACHER' | 'ADMIN'

export type Permission =
  // Full course content without buying it.
  | 'course:full'
  // Every phase unlocked, so a teacher can open any exercise they assign.
  | 'course:allPhases'
  // Create cohorts, invite students, buy seats, see the teacher dashboard.
  | 'cohort:manage'
  // Act on every cohort, not just ones you teach.
  | 'cohort:manageAny'
  // Change other users' roles.
  | 'user:assignRole'

const ROLE_PERMISSIONS: Record<RoleName, readonly Permission[]> = {
  STUDENT: [],
  TEACHER: ['course:full', 'course:allPhases', 'cohort:manage'],
  ADMIN: [
    'course:full',
    'course:allPhases',
    'cohort:manage',
    'cohort:manageAny',
    'user:assignRole',
  ],
}

export function roleHas(
  role: RoleName | null | undefined,
  permission: Permission,
): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function can(
  user: Pick<User, 'role'> | null | undefined,
  permission: Permission,
): boolean {
  return roleHas(user?.role as RoleName | undefined, permission)
}

export function permissionsFor(role: RoleName): Permission[] {
  return [...ROLE_PERMISSIONS[role]]
}

// Resolve the DB user for the request's Auth0 session (by `sub`, never email).
export async function getSessionUser(
  req: NextApiRequest | any,
  res: NextApiResponse | any,
): Promise<{ user: User | null; claims: Record<string, any> | null }> {
  const session = await getSession(req, res)
  const sub = session?.user?.sub
  if (!sub) return { user: null, claims: null }
  const user = await prisma.user.findUnique({ where: { auth0Id: sub } })
  return { user, claims: session!.user }
}

type AuthedHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: { user: User; claims: Record<string, any> },
) => unknown | Promise<unknown>

// Wrap an API route so it only runs for a signed-in user holding `permission`.
// 401 when signed out, 403 when the role doesn't allow it.
export function withPermission(
  permission: Permission | null,
  handler: AuthedHandler,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { user, claims } = await getSessionUser(req, res)
      if (!user || !claims) return res.status(401).json({ error: 'Unauthorized' })
      if (permission && !can(user, permission)) {
        return res.status(403).json({ error: 'Forbidden' })
      }
      return await handler(req, res, { user, claims })
    } catch (e) {
      console.error(e)
      if (!res.headersSent) res.status(500).json({ error: 'Internal error' })
    }
  }
}
