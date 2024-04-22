// useQuiz.ts
import { useEffect, useState } from 'react'
import { QuizData } from './QuizTypes'

const useQuiz = (isOpen: boolean, lessonId: number) => {
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<{
    [questionId: number]: number[]
  }>({})
  const [showCorrectMessage, setShowCorrectMessage] = useState<{
    [questionId: number]: boolean
  }>({})

  useEffect(() => {
    const fetchQuizData = async () => {
      if (isOpen && lessonId) {
        const response = await fetch(`/api/quiz?lessonId=${lessonId}`)
        const data: QuizData = await response.json()
        setQuizData(data)
        setSelectedOptions(
          data.questions.reduce((acc, question) => {
            acc[question.id] = []
            return acc
          }, {} as { [questionId: number]: number[] }),
        )
        setShowCorrectMessage(
          data.questions.reduce((acc, question) => {
            acc[question.id] = false
            return acc
          }, {} as { [questionId: number]: boolean }),
        )
      }
    }

    fetchQuizData()
  }, [isOpen, lessonId])

  return {
    quizData,
    selectedOptions,
    setSelectedOptions,
    showCorrectMessage,
    setShowCorrectMessage,
  }
}

export default useQuiz
