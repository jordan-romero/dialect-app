export type Course = {
  id: number
  title: string
  description: string
  lessons: []
  // Define other fields in your Course type as needed
}

export type CourseSideBarProps = {
  freeCourses: Course[] | null
  onSelectLesson: any
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
