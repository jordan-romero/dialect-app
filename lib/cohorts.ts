// Cohorts: teacher-led classes. Join codes, seats, joining, and the resource
// checks that keep a teacher to their own cohorts and students.
import { randomBytes, randomInt } from 'crypto'
import type { Cohort, Prisma, User } from '@prisma/client'
import { prisma } from './prisma'
import { can } from './rbac'

// ---- Join codes and invite tokens ----

// No 0/O, 1/I/L, so a code read off a projector or a printout types cleanly.
const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
const CODE_LENGTH = 6

export function generateJoinCode(): string {
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
  }
  return code
}

// Accepts "k7f-3qx", "K7F 3QX", etc.
export function normalizeJoinCode(input: string): string {
  return input.toUpperCase().replace(/[^0-9A-Z]/g, '')
}

export function formatJoinCode(code: string): string {
  return code.length === 6 ? `${code.slice(0, 3)}-${code.slice(3)}` : code
}

export async function uniqueJoinCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateJoinCode()
    const clash = await prisma.cohort.findUnique({ where: { joinCode: code } })
    if (!clash) return code
  }
  throw new Error('Could not generate a unique join code')
}

export function generateInviteToken(): string {
  return randomBytes(24).toString('base64url')
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export function isEmail(s: string): boolean {
  return EMAIL_RE.test(s)
}

export function appOrigin(req: { headers: Record<string, any> }): string {
  if (process.env.AUTH0_BASE_URL) return process.env.AUTH0_BASE_URL
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const proto = req.headers['x-forwarded-proto'] || 'https'
  return host ? `${proto}://${host}` : ''
}

// ---- Seats ----

export const activeMemberWhere = { removedAt: null } as const

export async function seatsUsed(
  cohortId: number,
  db: Prisma.TransactionClient = prisma,
): Promise<number> {
  return db.cohortMember.count({
    where: { cohortId, usesSeat: true, removedAt: null },
  })
}

export function cohortIsOpen(
  cohort: Pick<Cohort, 'archivedAt' | 'endsAt'>,
  now = new Date(),
): boolean {
  if (cohort.archivedAt) return false
  if (cohort.endsAt && cohort.endsAt <= now) return false
  return true
}

// Seats in a cohort = the sum over its seat purchases that aren't refunded or
// lost, minus seats refunded in proportion to partial refunds.
export async function recalcSeats(cohortId: number): Promise<number> {
  const purchases = await prisma.purchase.findMany({
    where: { cohortId, kind: 'SEATS', status: { in: ['PAID', 'DISPUTED'] } },
  })
  const seats = purchases.reduce((n, p) => {
    if (p.amountTotal <= 0) return n + p.quantity
    const refundedSeats = Math.round(
      (p.amountRefunded / p.amountTotal) * p.quantity,
    )
    return n + Math.max(0, p.quantity - refundedSeats)
  }, 0)
  await prisma.cohort.update({
    where: { id: cohortId },
    data: { seatCount: seats },
  })
  await fillWaitingSeats(cohortId)
  return seats
}

// A student in a seat class who has no seat and no course access of their own
// is waiting for one. They can join before the teacher buys seats (or after
// they run out) and get one as soon as seats are free.
export const waitingMemberWhere = {
  usesSeat: false,
  removedAt: null,
  user: { hasAccessToPaidCourses: false, role: 'STUDENT' },
} as const satisfies Prisma.CohortMemberWhereInput

export function isWaitingForSeat(
  cohort: Pick<Cohort, 'paymentMode'>,
  member: { usesSeat: boolean },
  user: Pick<User, 'hasAccessToPaidCourses' | 'role'>,
): boolean {
  return (
    cohort.paymentMode === 'SEATS' &&
    !member.usesSeat &&
    !user.hasAccessToPaidCourses &&
    !can(user, 'course:full')
  )
}

// Hand free seats to waiting students, earliest joiner first. Run after
// seats are bought and after a seat is freed. Locks the cohort row, like
// joining does, so it can't race a join for the same seat.
export async function fillWaitingSeats(cohortId: number): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<
      { seatCount: number; paymentMode: string }[]
    >`SELECT "seatCount", "paymentMode"::text FROM "Cohort" WHERE id = ${cohortId} FOR UPDATE`
    const c = rows[0]
    if (!c || c.paymentMode !== 'SEATS') return 0
    const free = c.seatCount - (await seatsUsed(cohortId, tx))
    if (free <= 0) return 0
    const waiting = await tx.cohortMember.findMany({
      where: { cohortId, ...waitingMemberWhere },
      orderBy: { joinedAt: 'asc' },
      take: free,
      select: { id: true },
    })
    if (waiting.length === 0) return 0
    await tx.cohortMember.updateMany({
      where: { id: { in: waiting.map((w) => w.id) } },
      data: { usesSeat: true },
    })
    return waiting.length
  })
}

// ---- Resource checks ----

// The cohort, if this user may manage it (they teach it, or they're an admin).
// Returns null otherwise, which callers turn into a 404 so cohort ids don't
// leak to other teachers.
export async function loadCohortFor(
  user: User,
  cohortId: number,
): Promise<Cohort | null> {
  if (!Number.isInteger(cohortId)) return null
  if (!can(user, 'cohort:manage')) return null
  const cohort = await prisma.cohort.findUnique({ where: { id: cohortId } })
  if (!cohort) return null
  if (cohort.teacherId !== user.id && !can(user, 'cohort:manageAny'))
    return null
  return cohort
}

// The student, if they're a current member of this cohort. A student who left
// or was removed is no longer visible to the teacher.
export async function loadStudentInCohort(cohortId: number, studentId: number) {
  if (!Number.isInteger(studentId)) return null
  const member = await prisma.cohortMember.findUnique({
    where: { cohortId_userId: { cohortId, userId: studentId } },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
    },
  })
  if (!member || member.removedAt) return null
  return member
}

// ---- Joining ----

export type JoinResult =
  | {
      ok: true
      cohortId: number
      cohortName: string
      alreadyMember: boolean
      usesSeat: boolean
      // SELF_PAY cohort and the student hasn't bought the course yet.
      needsPurchase: boolean
      // SEATS cohort with no free seat: joined, waiting for the teacher.
      waitingForSeat: boolean
    }
  | { ok: false; status: number; code: string; message: string }

type JoinTarget = { code: string } | { token: string }

// Join a cohort by its join code or by an emailed invite token.
//
// Seat cohorts: a student who doesn't already own the course takes a seat if
// one is free, and otherwise joins and waits for one. The seat check runs in a transaction that locks the cohort row,
// so two students can't both take the last seat.
export async function joinCohort(
  user: User,
  claims: Record<string, any>,
  target: JoinTarget,
): Promise<JoinResult> {
  let cohort: Cohort | null = null
  let inviteId: number | null = null

  if ('token' in target) {
    const invite = await prisma.cohortInvite.findUnique({
      where: { token: target.token },
      include: { cohort: true },
    })
    if (!invite || invite.revokedAt) {
      return fail(404, 'invite_not_found', 'This invite link is not valid.')
    }
    if (invite.acceptedAt && invite.acceptedBy !== user.id) {
      return fail(410, 'invite_used', 'This invite has already been used.')
    }
    // Invites are addressed to an email; only that verified email may use it.
    if (claims.email_verified !== true) {
      return fail(
        403,
        'email_unverified',
        'Verify your email address first, then open the invite link again.',
      )
    }
    if (normalizeEmail(String(claims.email || '')) !== invite.email) {
      return fail(
        403,
        'invite_wrong_email',
        `This invite was sent to ${invite.email}. Sign in with that address to accept it.`,
      )
    }
    cohort = invite.cohort
    inviteId = invite.id
  } else {
    const code = normalizeJoinCode(target.code)
    cohort = code
      ? await prisma.cohort.findUnique({ where: { joinCode: code } })
      : null
    if (!cohort || !cohort.joinEnabled) {
      return fail(404, 'code_not_found', 'That class code is not valid.')
    }
  }

  if (!cohortIsOpen(cohort)) {
    return fail(410, 'cohort_closed', 'This class is no longer open.')
  }
  if (cohort.teacherId === user.id) {
    return fail(400, 'own_cohort', 'You teach this class.')
  }

  const ownsCourse = user.hasAccessToPaidCourses || can(user, 'course:full')
  const wantsSeat = cohort.paymentMode === 'SEATS' && !ownsCourse
  const c = cohort

  try {
    return await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Cohort" WHERE id = ${c.id} FOR UPDATE`

      const existing = await tx.cohortMember.findUnique({
        where: { cohortId_userId: { cohortId: c.id, userId: user.id } },
      })
      if (existing && !existing.removedAt) {
        if (inviteId) await markInviteAccepted(tx, inviteId, user.id)
        return ok(
          c,
          true,
          existing.usesSeat,
          ownsCourse,
          wantsSeat && !existing.usesSeat,
        )
      }

      // No free seat: join anyway and wait for one (fillWaitingSeats hands it
      // over when the teacher buys more or someone leaves).
      const takesSeat = wantsSeat && (await seatsUsed(c.id, tx)) < c.seatCount

      if (existing) {
        await tx.cohortMember.update({
          where: { id: existing.id },
          data: { removedAt: null, usesSeat: takesSeat, joinedAt: new Date() },
        })
      } else {
        await tx.cohortMember.create({
          data: { cohortId: c.id, userId: user.id, usesSeat: takesSeat },
        })
      }
      if (inviteId) await markInviteAccepted(tx, inviteId, user.id)
      return ok(c, false, takesSeat, ownsCourse, wantsSeat && !takesSeat)
    })
  } catch (e) {
    console.error('joinCohort failed:', e)
    return fail(500, 'join_failed', 'Could not join the class. Try again.')
  }
}

async function markInviteAccepted(
  tx: Prisma.TransactionClient,
  inviteId: number,
  userId: number,
) {
  await tx.cohortInvite.updateMany({
    where: { id: inviteId, acceptedAt: null },
    data: { acceptedAt: new Date(), acceptedBy: userId },
  })
}

function ok(
  c: Cohort,
  alreadyMember: boolean,
  usesSeat: boolean,
  ownsCourse: boolean,
  waitingForSeat = false,
): JoinResult {
  return {
    ok: true,
    cohortId: c.id,
    cohortName: c.name,
    alreadyMember,
    usesSeat,
    needsPurchase: c.paymentMode === 'SELF_PAY' && !ownsCourse,
    waitingForSeat,
  }
}

function fail(status: number, code: string, message: string): JoinResult {
  return { ok: false, status, code, message }
}
