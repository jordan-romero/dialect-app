// Teacher dashboard data: a cohort's roster with each student's progress.
// Computed with a handful of grouped queries (not per student), so a large
// class stays one round trip per table.
import { prisma } from './prisma'

export type OutlineLesson = {
  id: number
  title: string
  courseId: number
  courseTitle: string
}

// Every lesson in course order: phases by id, lessons by displayOrder then id
// (the same order the student dashboard uses).
export async function courseOutline(): Promise<OutlineLesson[]> {
  const courses = await prisma.course.findMany({
    orderBy: { id: 'asc' },
    select: {
      id: true,
      title: true,
      lessons: {
        select: { id: true, title: true, displayOrder: true },
        orderBy: [
          { displayOrder: { sort: 'asc', nulls: 'last' } },
          { id: 'asc' },
        ],
      },
    },
  })
  return courses.flatMap((c) =>
    c.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      courseId: c.id,
      courseTitle: c.title,
    })),
  )
}

export type RosterRow = {
  userId: number
  email: string
  name: string | null
  joinedAt: string
  usesSeat: boolean
  lessonsCompleted: number
  totalLessons: number
  currentLesson: { id: number; title: string; courseTitle: string } | null
  exercisesSubmitted: number
  totalExercises: number
  lastActive: string | null
}

export async function cohortRoster(cohortId: number): Promise<RosterRow[]> {
  const members = await prisma.cohortMember.findMany({
    where: { cohortId, removedAt: null },
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true },
      },
    },
    orderBy: { joinedAt: 'asc' },
  })
  if (members.length === 0) return []
  const ids = members.map((m) => m.userId)

  const [outline, totalExercises, progress, answerGroups, answerLast] =
    await Promise.all([
      courseOutline(),
      prisma.quiz.count(),
      prisma.lessonProgress.findMany({
        where: { userId: { in: ids } },
        select: { userId: true, lessonId: true, progress: true, updatedAt: true },
      }),
      prisma.userAnswer.groupBy({
        by: ['userId', 'quizId'],
        where: { userId: { in: ids } },
      }),
      prisma.userAnswer.groupBy({
        by: ['userId'],
        where: { userId: { in: ids } },
        _max: { updatedAt: true },
      }),
    ])

  const done = new Map<number, Set<number>>()
  const last = new Map<number, Date>()
  const bump = (uid: number, d: Date | null | undefined) => {
    if (!d) return
    const cur = last.get(uid)
    if (!cur || d > cur) last.set(uid, d)
  }
  progress.forEach((p) => {
    if (p.progress >= 100) {
      if (!done.has(p.userId)) done.set(p.userId, new Set())
      done.get(p.userId)!.add(p.lessonId)
    }
    bump(p.userId, p.updatedAt)
  })
  answerLast.forEach((a) => bump(a.userId, a._max.updatedAt))
  const exercises = new Map<number, number>()
  answerGroups.forEach((g) =>
    exercises.set(g.userId, (exercises.get(g.userId) || 0) + 1),
  )

  return members.map((m) => {
    const d = done.get(m.userId) || new Set<number>()
    const current = outline.find((l) => !d.has(l.id)) || null
    const name =
      [m.user.firstName, m.user.lastName].filter(Boolean).join(' ') || null
    return {
      userId: m.userId,
      email: m.user.email,
      name,
      joinedAt: m.joinedAt.toISOString(),
      usesSeat: m.usesSeat,
      lessonsCompleted: outline.filter((l) => d.has(l.id)).length,
      totalLessons: outline.length,
      currentLesson: current
        ? { id: current.id, title: current.title, courseTitle: current.courseTitle }
        : null,
      exercisesSubmitted: exercises.get(m.userId) || 0,
      totalExercises,
      lastActive: last.get(m.userId)?.toISOString() ?? null,
    }
  })
}
