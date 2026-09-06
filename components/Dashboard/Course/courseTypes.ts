import { AnswerOption, Question } from '../Exercises/QuizTypes'

export type Course = {
  id: number
  title: string
  description: string
  lessons: Lesson[]
  isGatedCourse: boolean
  isCompleted: boolean
}

export type Resource = {
  id: number
  name: string
  type: string
  url: string
  courseId: number | null
  lessonId: number
  order: number
}

export type Quiz = {
  id: number
  title?: string | null
  lessonId: number
  score: number | null
  passScore: number
  hasBeenAttempted: boolean
  quizType: string
  questions: Question[]
  answerOptions: AnswerOption[]
  order: number
}

type LessonStep = {
  type: 'description' | 'video' | 'resource' | 'quiz' | 'outro'
}

export type Lesson = {
  id: number
  title: string
  description: string
  videoUrl: string
  videoTitle?: string | null
  courseId: number
  isGatedLesson: boolean
  isCompleted: boolean
  passScore: number | null // Assuming passScore can be nullable
  resources: Resource[]
  quiz: Quiz[]
  steps?: LessonStep[]
  displayOrder: number | null
  autoOpenIpaKeyboard?: boolean
}
