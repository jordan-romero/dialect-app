import { useEffect, useState } from 'react'
import { QuizData } from './QuizTypes'

const useQuiz = (lessonId: number) => {
  const [quizzes, setQuizzes] = useState<QuizData[]>([])
  const [selectedOptions, setSelectedOptions] = useState<{
    [quizId: number]: { [questionId: number]: number[] }
  }>({})
  const [showCorrectMessage, setShowCorrectMessage] = useState<{
    [quizId: number]: { [questionId: number]: boolean }
  }>({})

  useEffect(() => {
    const fetchQuizData = async () => {
      if (lessonId) {
        const response = await fetch(`/api/quizzes?lessonId=${lessonId}`)
        const data: QuizData[] = await response.json()

        console.log(data, 'quiz data in hook')
        setQuizzes(data)

        const initialSelectedOptions: {
          [quizId: number]: { [questionId: number]: number[] }
        } = {}
        const initialShowCorrectMessage: {
          [quizId: number]: { [questionId: number]: boolean }
        } = {}

        data.forEach((quiz) => {
          initialSelectedOptions[quiz.id] = quiz.questions.reduce(
            (acc, question) => {
              acc[question.id] = []
              return acc
            },
            {} as { [questionId: number]: number[] },
          )

          initialShowCorrectMessage[quiz.id] = quiz.questions.reduce(
            (acc, question) => {
              acc[question.id] = false
              return acc
            },
            {} as { [questionId: number]: boolean },
          )
        })

        setSelectedOptions(initialSelectedOptions)
        setShowCorrectMessage(initialShowCorrectMessage)
      }
    }

    fetchQuizData()
  }, [lessonId])

  return {
    quizzes,
    selectedOptions,
    setSelectedOptions,
    showCorrectMessage,
    setShowCorrectMessage,
  }
}

export default useQuiz
