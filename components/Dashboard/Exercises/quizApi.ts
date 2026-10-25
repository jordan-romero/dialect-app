// Shared fetch boilerplate for quiz exercises. Each exercise still owns its own
// state (loading, completion, answer shaping); these helpers just centralize the
// two network calls so the request/response handling stays consistent.

export interface QuizAnswerInput {
  questionId: number
  textAnswer: string
}

/** POST the user's answers for a quiz. Returns true on a 2xx response. */
export async function postQuizAnswers(params: {
  quizId: number
  lessonId: number
  answers: QuizAnswerInput[]
}): Promise<boolean> {
  const response = await fetch('/api/submitQuiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  return response.ok
}

export interface QuizProgress {
  isCompleted: boolean
  answers: Array<{ questionId: number; textAnswer: string }>
}

/** Load saved progress for a quiz. Returns null if the request fails. */
export async function fetchQuizProgress(
  quizId: number,
  lessonId: number,
): Promise<QuizProgress | null> {
  const response = await fetch(
    `/api/userQuizProgress?quizId=${quizId}&lessonId=${lessonId}`,
  )
  if (!response.ok) return null
  const data = await response.json()
  return {
    isCompleted: !!data.isCompleted,
    answers: Array.isArray(data.answers) ? data.answers : [],
  }
}
