// Builds the public course outline for the /course page from the course
// database. Runs on the server only (getStaticProps), so nothing here reaches
// the browser except titles, summaries, exercise names and counts.
//
// Reads only outline fields: no video URLs, handout URLs or exercise content.
import { PrismaClient } from '@prisma/client'
import {
  computeStats,
  CourseStats,
  OutlinePhase,
  PHASE_COPY,
} from '../components/CoursePage/courseOutline'

// The closing congratulations video isn't a lesson worth listing.
const HIDDEN_LESSON = /^outro$/i

// A phase's Course.description holds its page copy as two parts: a headline
// on the first line, then the subtitle. Anything else (an empty or internal
// note) falls back to the built-in copy for that phase.
const parsePhaseCopy = (description: string) => {
  const [headline, ...rest] = description.trim().split(/\r?\n/)
  const blurb = rest.join(' ').trim()
  if (!headline?.trim() || blurb.length < 20) return null
  return { title: headline.trim(), blurb }
}

let prisma: PrismaClient | undefined
const client = () => (prisma ??= new PrismaClient())

export async function loadCourseOutline(): Promise<{
  phases: OutlinePhase[]
  stats: CourseStats
}> {
  const courses = await client().course.findMany({
    orderBy: { id: 'asc' },
    select: {
      title: true,
      description: true,
      lessons: {
        // Same order as the course sidebar: checkpoints (no displayOrder) last.
        orderBy: [
          { displayOrder: { sort: 'asc', nulls: 'last' } },
          { id: 'asc' },
        ],
        select: {
          title: true,
          description: true,
          displayOrder: true,
          isGatedLesson: true,
          quiz: {
            orderBy: [{ order: 'asc' }, { id: 'asc' }],
            select: { title: true },
          },
          _count: { select: { resources: true } },
        },
      },
    },
  })

  let handouts = 0
  const phases: OutlinePhase[] = courses
    .map((course, i) => {
      const lessons = course.lessons.filter(
        (l) => !HIDDEN_LESSON.test(l.title.trim()),
      )
      handouts += lessons.reduce((n, l) => n + l._count.resources, 0)
      const copy = parsePhaseCopy(course.description) ?? PHASE_COPY[i]
      return {
        name: course.title.trim(),
        title: copy?.title ?? course.title.trim(),
        blurb: copy?.blurb ?? '',
        lessons: lessons.map((l) => {
          const exercises = l.quiz
            .map((q) => q.title?.trim())
            .filter((t): t is string => !!t)
          return {
            title: l.title.trim(),
            summary: l.description.trim(),
            ...(exercises.length ? { exercises } : {}),
            ...(l.isGatedLesson ? {} : { free: true }),
            ...(l.displayOrder == null ? { checkpoint: true } : {}),
          }
        }),
      }
    })
    .filter((p) => p.lessons.length > 0)

  if (phases.length === 0) throw new Error('Course outline is empty')
  return { phases, stats: computeStats(phases, handouts) }
}
