import { Lesson, Quiz, Resource } from '../Course/courseTypes'

const quizTypeLabels: Record<string, string> = {
  dragAndDrop: 'Drag and drop',
  shortAnswer: 'Short answer',
  multipleChoice: 'Multiple choice',
  symbolPicker: 'Symbol picker',
  vowelQuad: 'Vowel quadrilateral',
  lexicalChart: 'Lexical chart',
  hangman: 'Hangman',
  consonantRect: 'Consonant rectangle',
  corrections: 'Corrections',
  buildAWord: 'Build-a-word',
  repeatAfterMe: 'Repeat after me',
}

const getQuizOutlineLabel = (quiz: Quiz | undefined): string => {
  if (!quiz) return 'Exercise'
  const custom = quiz.title?.trim()
  if (custom) return custom
  const t = quiz.quizType?.trim()
  if (t && quizTypeLabels[t]) return quizTypeLabels[t]
  return 'Exercise'
}

/** A single concrete step in the lesson flow. Resource steps carry the index
 *  of the specific resource they show. */
export type EffectiveStep = {
  type: 'description' | 'video' | 'resource' | 'quiz' | 'outro'
  resourceIndex?: number
}

/** Resources sorted into their authored display order. */
export const orderedResources = (lesson: Lesson): Resource[] =>
  [...(lesson.resources ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id,
  )

/**
 * Expand a lesson's stored `steps` into the concrete sequence the learner walks
 * through with Next/Previous — exactly ONE resource per resource step.
 *
 * The stored steps may have fewer `resource` entries than the lesson actually
 * has resources (resources were added later without updating the step outline).
 * To keep every resource reachable, the LAST resource step absorbs all the
 * remaining resources, so they each become their own step in order. Extra
 * resource steps with no resource to show are dropped (no empty pages).
 */
export const expandLessonSteps = (lesson: Lesson): EffectiveStep[] => {
  const steps = lesson.steps ?? []
  const resources = orderedResources(lesson)
  const total = resources.length

  const resourceStepPositions = steps.reduce<number[]>((acc, s, i) => {
    if (s.type === 'resource') acc.push(i)
    return acc
  }, [])
  const lastResourceStep =
    resourceStepPositions[resourceStepPositions.length - 1]

  const out: EffectiveStep[] = []
  let cursor = 0

  steps.forEach((step, i) => {
    if (step.type !== 'resource') {
      // Skip a video step when there's no video to show.
      if (step.type === 'video' && !lesson.videoUrl) return
      out.push({ type: step.type })
      return
    }
    if (i === lastResourceStep) {
      // Last resource step: emit one step per remaining resource.
      for (; cursor < total; cursor++) {
        out.push({ type: 'resource', resourceIndex: cursor })
      }
    } else if (cursor < total) {
      out.push({ type: 'resource', resourceIndex: cursor })
      cursor += 1
    }
    // else: extra resource step with nothing to show — drop it.
  })

  // Defensive: resources exist but the lesson had no resource step at all.
  // Surface them right before the outro (or at the end) so nothing is lost.
  if (cursor < total) {
    const extras: EffectiveStep[] = []
    for (; cursor < total; cursor++) {
      extras.push({ type: 'resource', resourceIndex: cursor })
    }
    const outroAt = out.findIndex((s) => s.type === 'outro')
    if (outroAt >= 0) out.splice(outroAt, 0, ...extras)
    else out.push(...extras)
  }

  return out
}

/** Labels for the lesson flow, in step order (video, handouts, exercises, etc.). */
export const buildLessonOutlineLabels = (lesson: Lesson): string[] => {
  const resources = orderedResources(lesson)
  const labels: string[] = []
  let quizIdx = 0

  for (const step of expandLessonSteps(lesson)) {
    switch (step.type) {
      case 'video': {
        const vt = lesson.videoTitle?.trim()
        labels.push(vt || 'Video')
        break
      }
      case 'resource': {
        const r = resources[step.resourceIndex ?? 0]
        if (r) labels.push(r.name)
        break
      }
      case 'quiz': {
        const quiz = lesson.quiz?.find((q) => q.order === quizIdx)
        labels.push(getQuizOutlineLabel(quiz))
        quizIdx += 1
        break
      }
      default:
        break
    }
  }

  return labels
}

export interface OutlineItem {
  type: 'video' | 'resource' | 'quiz'
  label: string
}

/** Typed outline (item kind + label) for the lesson description list. */
export const buildLessonOutline = (lesson: Lesson): OutlineItem[] => {
  const resources = orderedResources(lesson)
  const items: OutlineItem[] = []
  let quizIdx = 0

  for (const step of expandLessonSteps(lesson)) {
    if (step.type === 'video') {
      items.push({ type: 'video', label: lesson.videoTitle?.trim() || 'Video' })
    } else if (step.type === 'resource') {
      const r = resources[step.resourceIndex ?? 0]
      if (r) items.push({ type: 'resource', label: r.name })
    } else if (step.type === 'quiz') {
      const quiz = lesson.quiz?.find((q) => q.order === quizIdx)
      items.push({ type: 'quiz', label: getQuizOutlineLabel(quiz) })
      quizIdx += 1
    }
  }

  return items
}
