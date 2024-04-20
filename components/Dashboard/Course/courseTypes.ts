export type Course = {
  id: number
  title: string
  description: string
  lessons: []
  isGatedCourse: boolean
}

export type Resource = {
  id: number
  name: string
  type: string
  url: string
  courseId: number | null // Assuming courseId can be nullable
  lessonId: number
}

export type Quiz = {
  id: number
  lessonId: number
  score: number | null // Assuming score can be nullable
  passScore: number
}

export type Lesson = {
  id: number
  title: string
  description: string
  videoUrl: string
  courseId: number
  passScore: number | null // Assuming passScore can be nullable
  resources: Resource[]
  quiz: Quiz | null // Assuming quiz can be nullable
}
