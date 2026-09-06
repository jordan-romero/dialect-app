// Shared dashboard/overview computation: continue lesson, progress, streak, and
// derived badges. Used by /api/overview and /api/badges/check so the badge
// logic never diverges.
import { PrismaClient, User } from '@prisma/client'
import { getUnlockedCourseIds } from './access'

export interface BadgeResult {
  id: string
  label: string
  hint: string
  earned: boolean
  count?: number
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10)

const computeStreak = (days: Set<string>) => {
  if (days.size === 0) return { current: 0, best: 0 }
  let current = 0
  const cursor = new Date()
  if (!days.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1)
  while (days.has(dayKey(cursor))) {
    current += 1
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  const sorted = Array.from(days).sort()
  let best = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    prev.setUTCDate(prev.getUTCDate() + 1)
    if (dayKey(prev) === sorted[i]) {
      run += 1
      best = Math.max(best, run)
    } else {
      run = 1
    }
  }
  return { current, best: Math.max(best, current) }
}

export async function computeOverview(
  prisma: PrismaClient,
  user: User,
  email: string,
) {
  const [courses, progressRows, answers] = await Promise.all([
    prisma.course.findMany({
      include: { lessons: { orderBy: { id: 'asc' } } },
      orderBy: { id: 'asc' },
    }),
    prisma.lessonProgress.findMany({
      where: { userId: user.id },
      select: { lessonId: true, progress: true, updatedAt: true },
    }),
    prisma.userAnswer.findMany({
      where: { userId: user.id },
      select: { quizId: true, createdAt: true, updatedAt: true },
    }),
  ])

  const progressMap: Record<number, number> = {}
  progressRows.forEach((p) => (progressMap[p.lessonId] = p.progress))
  const isDone = (lessonId: number) => (progressMap[lessonId] || 0) >= 100

  const unlocked = await getUnlockedCourseIds(prisma, email)

  const orderLessons = (c: any) =>
    [...(c.lessons || [])].sort(
      (a, b) =>
        (a.displayOrder ?? Number.POSITIVE_INFINITY) -
        (b.displayOrder ?? Number.POSITIVE_INFINITY),
    )

  const phases = courses.map((c: any) => {
    const lessons = orderLessons(c)
    return {
      id: c.id,
      title: c.title,
      unlocked: unlocked.has(c.id),
      total: lessons.length,
      completed: lessons.filter((l: any) => isDone(l.id)).length,
    }
  })

  const allLessons = courses.flatMap((c: any) =>
    orderLessons(c).map((l: any) => ({ ...l, courseId: c.id })),
  )
  const totalLessons = allLessons.length
  const completedLessons = allLessons.filter((l: any) => isDone(l.id)).length

  const continueLesson =
    allLessons.find((l: any) => unlocked.has(l.courseId) && !isDone(l.id)) ||
    allLessons[0]
  const continuePhase = courses.find(
    (c: any) => c.id === continueLesson?.courseId,
  )

  const days = new Set<string>()
  answers.forEach((a) => {
    days.add(dayKey(a.createdAt))
    days.add(dayKey(a.updatedAt))
  })
  progressRows.forEach((p) => days.add(dayKey(p.updatedAt)))
  const streak = computeStreak(days)

  const quizzesCompleted = new Set(answers.map((a) => a.quizId)).size
  const phaseDone = (idx: number) =>
    phases[idx] &&
    phases[idx].total > 0 &&
    phases[idx].completed === phases[idx].total
  const allDone = totalLessons > 0 && completedLessons === totalLessons
  const checkpointsCompleted = allLessons.filter(
    (l: any) => /checkpoint/i.test(l.title || '') && isDone(l.id),
  ).length

  const badges: BadgeResult[] = [
    {
      id: 'first',
      label: 'First Take',
      hint: 'Complete your first lesson',
      earned: completedLessons >= 1,
    },
    {
      id: 'breakaleg',
      label: 'Break a Leg',
      hint: 'Complete your first exercise',
      earned: quizzesCompleted >= 1,
    },
    {
      id: 'quiz10',
      label: 'Quiz Whiz',
      hint: 'Complete 10 exercises',
      earned: quizzesCompleted >= 10,
    },
    {
      id: 'checkpoint',
      label: 'Checkpoint Champion',
      hint: 'Pass a checkpoint',
      earned: checkpointsCompleted >= 1,
      count: checkpointsCompleted,
    },
    {
      id: 'phase1',
      label: 'Phase 1 Done',
      hint: 'Finish Phase 1',
      earned: phaseDone(0),
    },
    {
      id: 'phase2',
      label: 'Phase 2 Done',
      hint: 'Finish Phase 2',
      earned: phaseDone(1),
    },
    {
      id: 'phase3',
      label: 'Phase 3 Done',
      hint: 'Finish Phase 3',
      earned: phaseDone(2),
    },
    {
      id: 'streak3',
      label: 'On a Roll',
      hint: 'Practice 3 days in a row',
      earned: streak.best >= 3,
    },
    {
      id: 'streak7',
      label: 'Week Warrior',
      hint: 'Practice 7 days in a row',
      earned: streak.best >= 7,
    },
    {
      id: 'complete',
      label: 'Course Complete',
      hint: 'Finish the whole course',
      earned: allDone,
    },
  ]

  return {
    continue: continueLesson
      ? {
          lessonId: continueLesson.id,
          title: continueLesson.title,
          moduleNumber: continueLesson.displayOrder ?? null,
          phase: continuePhase?.title || '',
          done: isDone(continueLesson.id),
        }
      : null,
    overall: {
      completed: completedLessons,
      total: totalLessons,
      pct: totalLessons
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0,
    },
    phases,
    streak,
    badges,
  }
}
