import React, { useState, useEffect } from 'react'
import {
  Button,
  Box,
  Text,
  VStack,
  Input,
  Icon,
  useToast,
} from '@chakra-ui/react'
import { CheckCircleIcon } from '@chakra-ui/icons'
import useQuiz from './utils'
import QuizNavigation from './QuizNavigation'

interface ShortAnswerQuizProps {
  lessonId: number
  quizIndex: number
  onComplete: () => void
}

const ShortAnswerQuiz: React.FC<ShortAnswerQuizProps> = ({
  lessonId,
  quizIndex,
  onComplete,
}) => {
  const { quizzes } = useQuiz(lessonId)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<
    Record<number, Record<number, string>>
  >({})
  const [showSentence, setShowSentence] = useState(false)
  const [isQuestionComplete, setIsQuestionComplete] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const currentQuiz = quizzes[quizIndex]
  const currentQuestion = currentQuiz?.questions[currentQuestionIndex]

  const revealSentenceOption = currentQuestion?.answerOptions.find(
    (option) => option.audioUrl,
  )

  // Load saved progress when component mounts
  useEffect(() => {
    const loadProgress = async () => {
      if (!currentQuiz) return

      try {
        const response = await fetch(
          `/api/userQuizProgress?quizId=${currentQuiz.id}&lessonId=${lessonId}`,
        )
        if (response.ok) {
          const data = await response.json()
          setIsCompleted(data.isCompleted)

          // Restore saved answers
          if (data.answers && data.answers.length > 0) {
            const savedAnswers: Record<number, Record<number, string>> = {}
            data.answers.forEach((answer: any) => {
              try {
                // each question's inputs are stored as a JSON map {optionId: text}
                savedAnswers[answer.questionId] = JSON.parse(answer.textAnswer)
              } catch {
                savedAnswers[answer.questionId] = {}
              }
            })
            setAnswers(savedAnswers)
          }
        }
      } catch (error) {
        console.error('Error loading quiz progress:', error)
      }
    }

    loadProgress()
  }, [currentQuiz, lessonId])

  useEffect(() => {
    setIsQuestionComplete(false)
    setShowSentence(false)
  }, [currentQuestion])

  const handleAnswerChange = (
    questionId: number,
    answerId: number,
    value: string,
  ) => {
    // Once completed, responses are locked in place until "Try again".
    if (isCompleted) return
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: {
        ...prevAnswers[questionId],
        [answerId]: value,
      },
    }))
  }

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => Math.max(0, prevIndex - 1))
  }

  const handleNextQuestion = async () => {
    if (currentQuestionIndex === currentQuiz?.questions.length! - 1) {
      setIsQuestionComplete(true)
      await submitQuiz()
      onComplete()
    } else {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
      setShowSentence(false)
    }
  }

  const submitQuiz = async () => {
    if (!currentQuiz) return

    setIsLoading(true)
    try {
      // Store each question's inputs as ONE row — a JSON map of {optionId: text}
      // — so every response persists (UserAnswer is unique per question, so the
      // old one-row-per-input approach collapsed them all into one).
      const answersToSubmit = Object.entries(answers).map(
        ([questionId, questionAnswers]) => ({
          questionId: parseInt(questionId),
          textAnswer: JSON.stringify(questionAnswers),
        }),
      )

      const response = await fetch('/api/submitQuiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: currentQuiz.id,
          lessonId: lessonId,
          answers: answersToSubmit,
        }),
      })

      if (response.ok) {
        setIsCompleted(true)
      } else {
        console.error('Failed to submit quiz')
        toast({
          title: 'Error',
          description: 'Failed to save your answers. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const allInputsFilled = currentQuestion?.answerOptions
    .filter((option) => !option.audioUrl)
    .every((option) => answers[currentQuestion.id]?.[option.id])

  const playAudio = (audioUrl: string | undefined) => {
    const audio = new Audio(audioUrl)
    audio.play()
  }

  const isNextDisabled = !(
    showSentence ||
    (allInputsFilled && !revealSentenceOption)
  )

  return (
    <Box>
      {currentQuestion && (
        <Box>
          <Text fontSize="xl">{currentQuestion.text}</Text>
          {currentQuestion.audioUrl && (
            <Button
              onClick={() => playAudio(currentQuestion.audioUrl)}
              mt={2}
              mb={4}
            >
              Play Question Audio
            </Button>
          )}
          <VStack spacing={4} mt={4} align="start">
            {currentQuestion.answerOptions
              .filter((option) => !option.audioUrl)
              .map((option) => (
                <Box key={option.id} width="100%">
                  {/* When there's an audio "reveal sentence" option (e.g. the
                      "My Baby" exercise), the non-audio optionText is a prompt
                      and should always show. For answer-only reveal quizzes
                      (no audio option), optionText is the answer — hide it
                      until the learner clicks "Reveal Answer". */}
                  {revealSentenceOption && (
                    <Text mb={1}>{option.optionText}</Text>
                  )}
                  <Input
                    type="text"
                    placeholder="Type your answer…"
                    value={answers[currentQuestion.id]?.[option.id] || ''}
                    onChange={(e) =>
                      handleAnswerChange(
                        currentQuestion.id,
                        option.id,
                        e.target.value,
                      )
                    }
                    width="100%"
                    marginBottom={2}
                  />
                  {!revealSentenceOption && showSentence && (
                    <Text
                      mt={1}
                      fontFamily="'Charis SIL', serif"
                      color="green.700"
                    >
                      Answer: {option.optionText}
                    </Text>
                  )}
                </Box>
              ))}
          </VStack>
          {!revealSentenceOption && (
            <Button
              onClick={() => setShowSentence(true)}
              mt={4}
              variant="brandWhite"
              isDisabled={showSentence}
            >
              Reveal Answer
            </Button>
          )}
          {showSentence && revealSentenceOption && (
            <Box mt={4}>
              <Text>{revealSentenceOption.optionText}</Text>
              <Button
                onClick={() => playAudio(revealSentenceOption.audioUrl)}
                mt={2}
              >
                Play Sentence Audio
              </Button>
            </Box>
          )}
          {!showSentence && revealSentenceOption && (
            <Button
              onClick={() => setShowSentence(true)}
              mt={4}
              variant="brandWhite"
              isDisabled={!allInputsFilled}
            >
              Reveal Sentence
            </Button>
          )}
        </Box>
      )}
      {currentQuiz && currentQuiz.questions && (
        <QuizNavigation
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={currentQuiz.questions.length}
          onPrevious={handlePreviousQuestion}
          onNext={handleNextQuestion}
          onFinish={handleNextQuestion}
          isNextDisabled={isNextDisabled || isLoading}
          isCompleted={isCompleted}
        />
      )}
    </Box>
  )
}

export default ShortAnswerQuiz
