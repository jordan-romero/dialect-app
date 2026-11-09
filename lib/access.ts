// Paid-content access control.
//
// A lesson is free when `isGatedLesson === false` (the first three lessons).
// Everything else requires paid access, which a user has when ANY of these is
// true (see hasPaidAccess):
//   - they bought the course (User.hasAccessToPaidCourses, set by the Stripe
//     webhook against the buyer's Auth0 id),
//   - they hold a seat in a cohort whose seats are still valid (not removed,
//     cohort not archived, before the cohort's end date),
//   - their role grants it (teachers and admins get the full course free).
//
// Every lookup is by the Auth0 `sub` from the verified session, never by
// email: an email can be claimed by an unverified signup, a `sub` can't.
//
// ADMIN_EMAILS does NOT grant access — admins still go through the real paywall
// so the full Stripe flow gets tested. Instead, admin emails see the Stripe
// TEST card details in the unlock modal. ADMIN_EMAILS is a comma-separated list;
// entries may be an exact address or a whole domain (leading @, e.g.
// @romerodev.co covers all your test accounts).
import type { PrismaClient } from '@prisma/client'
import { roleHas } from './rbac'

// The signed-in identity, as Auth0 puts it on the session (`session.user`).
export type Viewer =
  | { sub?: string | null; email?: string | null; [k: string]: unknown }
  | null
  | undefined

export function isAllowlisted(email?: string | null): boolean {
  if (!email) return false
  const e = email.toLowerCase()
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .some((entry) => (entry.startsWith('@') ? e.endsWith(entry) : e === entry))
}

// Prisma filter for cohort memberships whose seat currently grants access.
export function activeSeatWhere(now = new Date()) {
  return {
    usesSeat: true,
    removedAt: null,
    cohort: {
      paymentMode: 'SEATS' as const,
      archivedAt: null,
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    },
  }
}

export type AccessInfo = {
  paid: boolean
  source: 'purchase' | 'seat' | 'role' | null
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | null
}

export async function getAccessInfo(
  prisma: PrismaClient,
  viewer: Viewer,
): Promise<AccessInfo> {
  const sub = viewer?.sub
  if (!sub) return { paid: false, source: null, role: null }
  const user = await prisma.user.findUnique({
    where: { auth0Id: sub },
    select: {
      role: true,
      hasAccessToPaidCourses: true,
      memberships: { where: activeSeatWhere(), select: { id: true }, take: 1 },
    },
  })
  if (!user) return { paid: false, source: null, role: null }
  if (user.hasAccessToPaidCourses)
    return { paid: true, source: 'purchase', role: user.role }
  if (user.memberships.length > 0)
    return { paid: true, source: 'seat', role: user.role }
  if (roleHas(user.role, 'course:full'))
    return { paid: true, source: 'role', role: user.role }
  return { paid: false, source: null, role: user.role }
}

// Does this signed-in user have access to PAID (gated) content?
export async function hasPaidAccess(
  prisma: PrismaClient,
  viewer: Viewer,
): Promise<boolean> {
  return (await getAccessInfo(prisma, viewer)).paid
}

// Sequential phase progression: a course (phase) is unlocked only when every
// lesson in the PREVIOUS course is complete (LessonProgress.progress >= 100).
// The first course is always unlocked. Teachers and admins have every phase
// unlocked so they can look at any exercise they assign. Returns the set of
// unlocked course ids.
export async function getUnlockedCourseIds(
  prisma: PrismaClient,
  viewer: Viewer,
): Promise<Set<number>> {
  const unlocked = new Set<number>()
  const courses = await prisma.course.findMany({
    orderBy: { id: 'asc' },
    select: { id: true, lessons: { select: { id: true } } },
  })

  const completed = new Set<number>()
  if (viewer?.sub) {
    const user = await prisma.user.findUnique({
      where: { auth0Id: viewer.sub },
      select: { id: true, role: true },
    })
    if (user && roleHas(user.role, 'course:allPhases')) {
      courses.forEach((c) => unlocked.add(c.id))
      return unlocked
    }
    if (user) {
      const lp = await prisma.lessonProgress.findMany({
        where: { userId: user.id, progress: { gte: 100 } },
        select: { lessonId: true },
      })
      lp.forEach((r) => completed.add(r.lessonId))
    }
  }

  let prevComplete = true // first phase always unlocked
  for (const c of courses) {
    if (prevComplete) unlocked.add(c.id)
    prevComplete =
      c.lessons.length > 0 && c.lessons.every((l) => completed.has(l.id))
  }
  return unlocked
}

// Server-side access check for a single lesson's content, mirroring the gate
// in /api/quizzes: the lesson's phase must be unlocked, and gated lessons
// require purchase. Endpoints that serve a fixed lesson's audio/data must call
// this with that lesson's own id (never a client-supplied one), so a caller
// can't pass a free lesson's id to unlock paid content.
export type LessonAccess =
  | { ok: true }
  | { ok: false; status: number; message: string }

export async function getLessonAccess(
  prisma: PrismaClient,
  viewer: Viewer,
  lessonId: number,
): Promise<LessonAccess> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { isGatedLesson: true, courseId: true },
  })
  if (!lesson) return { ok: false, status: 404, message: 'Lesson not found' }

  const [unlocked, paid] = await Promise.all([
    getUnlockedCourseIds(prisma, viewer),
    hasPaidAccess(prisma, viewer),
  ])
  if (!unlocked.has(lesson.courseId)) {
    return {
      ok: false,
      status: 403,
      message: 'Complete the previous phase to unlock this.',
    }
  }
  if (lesson.isGatedLesson && !paid) {
    return {
      ok: false,
      status: 403,
      message: 'This lesson requires full course access.',
    }
  }
  return { ok: true }
}

// Strip content from a lesson the user can't access, tagging WHY:
//   - 'phase' = the previous phase isn't complete yet (takes precedence)
//   - 'paid'  = gated lesson and the user hasn't purchased
// Keeps title/order so the UI can render a locked placeholder.
type GatedLesson<T> = T & { locked?: boolean; lockReason?: 'phase' | 'paid' }

export function gateLessonFull<T extends { isGatedLesson?: boolean | null }>(
  lesson: T,
  opts: { paidAccess: boolean; phaseUnlocked: boolean },
): GatedLesson<T> {
  const lock = (reason: 'phase' | 'paid'): GatedLesson<T> =>
    ({
      ...lesson,
      locked: true,
      lockReason: reason,
      videoUrl: null,
      resources: [],
      quiz: [],
    } as GatedLesson<T>)
  if (!opts.phaseUnlocked) return lock('phase')
  if (!opts.paidAccess && lesson?.isGatedLesson) return lock('paid')
  return lesson
}
