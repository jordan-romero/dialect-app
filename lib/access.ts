// Paid-content access control.
//
// A lesson is free when `isGatedLesson === false` (the first three lessons).
// Everything else requires access, granted only by User.hasAccessToPaidCourses
// (set by the Stripe webhook after purchase).
//
// ADMIN_EMAILS does NOT grant access — admins still go through the real paywall
// so the full Stripe flow gets tested. Instead, admin emails see the Stripe
// TEST card details in the unlock modal. ADMIN_EMAILS is a comma-separated list;
// entries may be an exact address or a whole domain (leading @, e.g.
// @romerodev.co covers all your test accounts).
import type { PrismaClient } from '@prisma/client'

export function isAllowlisted(email?: string | null): boolean {
  if (!email) return false
  const e = email.toLowerCase()
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .some((entry) => (entry.startsWith('@') ? e.endsWith(entry) : e === entry))
}

// Does this signed-in user have access to PAID (gated) content?
export async function hasPaidAccess(
  prisma: PrismaClient,
  email?: string | null,
): Promise<boolean> {
  if (!email) return false
  const user = await prisma.user.findUnique({
    where: { email },
    select: { hasAccessToPaidCourses: true },
  })
  return !!user?.hasAccessToPaidCourses
}

// Sequential phase progression: a course (phase) is unlocked only when every
// lesson in the PREVIOUS course is complete (LessonProgress.progress >= 100).
// The first course is always unlocked. Returns the set of unlocked course ids.
export async function getUnlockedCourseIds(
  prisma: PrismaClient,
  email?: string | null,
): Promise<Set<number>> {
  const unlocked = new Set<number>()
  const courses = await prisma.course.findMany({
    orderBy: { id: 'asc' },
    select: { id: true, lessons: { select: { id: true } } },
  })

  const completed = new Set<number>()
  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
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

// Strip content from a lesson the user can't access, tagging WHY:
//   - 'phase' = the previous phase isn't complete yet (takes precedence)
//   - 'paid'  = gated lesson and the user hasn't purchased
// Keeps title/order so the UI can render a locked placeholder.
export function gateLessonFull(
  lesson: any,
  opts: { paidAccess: boolean; phaseUnlocked: boolean },
): any {
  const lock = (reason: 'phase' | 'paid') => ({
    ...lesson,
    locked: true,
    lockReason: reason,
    videoUrl: null,
    resources: [],
    quiz: [],
  })
  if (!opts.phaseUnlocked) return lock('phase')
  if (!opts.paidAccess && lesson?.isGatedLesson) return lock('paid')
  return lesson
}
