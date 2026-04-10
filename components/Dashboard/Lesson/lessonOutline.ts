import { Lesson, Quiz } from '../Course/courseTypes'

const quizTypeLabels: Record<string, string> = {
  dragAndDrop: 'Drag and drop',
  shortAnswer: 'Short answer',
  multipleChoice: 'Multiple choice',
  symbolPicker: 'Symbol picker',
  vowelQuad: 'Vowel quadrilateral',
  lexicalChart: 'Lexical chart',
  hangman: 'Hangman',
}

const getQuizOutlineLabel = (quiz: Quiz | undefined): string => {
  if (!quiz) return 'Exercise'
  const custom = quiz.title?.trim()
  if (custom) return custom
  const t = quiz.quizType?.trim()
  if (t && quizTypeLabels[t]) return quizTypeLabels[t]
  return 'Exercise'
}

/** Labels for the lesson flow, in step order (video, handouts, exercises, etc.). */
export const buildLessonOutlineLabels = (lesson: Lesson): string[] => {
  const steps = lesson.steps ?? []
  const labels: string[] = []
  let resourceIdx = 0
  let quizIdx = 0
  const resources = lesson.resources ?? []

  for (const step of steps) {
    switch (step.type) {
      case 'video':
        if (lesson.videoUrl) {
          const vt = lesson.videoTitle?.trim()
          labels.push(vt || 'Video')
        }
        break
      case 'resource': {
        const r = resources[resourceIdx]
        if (r) labels.push(r.name)
        resourceIdx += 1
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
