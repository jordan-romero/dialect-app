export interface AnswerOption {
  id: number
  optionText: string
  isCorrect: boolean
  audioUrl: string
  rhymeCategory: string | null
  rhymingWordId: number | null
}

export interface ExtraOption {
  id: number
  optionText: string
}

export interface Question {
  id: number
  text: string
  questionType: string
  quizId: number
  answerOptions: AnswerOption[]
  extraOptions?: ExtraOption[]
}

export interface QuizData {
  id: number
  lessonId: number
  score: number | null
  passScore: number
  hasBeenAttempted: boolean
  questions: Question[]
  answerOptions: AnswerOption[]
}
