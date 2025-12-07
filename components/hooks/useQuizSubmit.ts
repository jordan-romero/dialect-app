import { useState } from 'react'
import { useToast } from '@chakra-ui/react'

interface UseQuizSubmitProps {
  quizId: number
  lessonId: number
  quizType: string
  onComplete: () => void
}

export const useQuizSubmit = ({
  quizId,
  lessonId,
  quizType,
  onComplete,
}: UseQuizSubmitProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  const submitQuiz = async (answers: Record<number, any>) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/submitQuiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId,
          lessonId,
          answers,
          quizType,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit quiz')
      }

      toast({
        title: 'Quiz submitted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      onComplete()
    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast({
        title: 'Failed to submit quiz',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return { submitQuiz, isSubmitting }
}
