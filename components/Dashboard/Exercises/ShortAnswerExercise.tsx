import React, { useState, useEffect } from 'react'
import { Button, Box, Text, VStack, Input, Icon } from '@chakra-ui/react'
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

  const currentQuiz = quizzes[quizIndex]
  const currentQuestion = currentQuiz?.questions[currentQuestionIndex]

  const revealSentenceOption = currentQuestion?.answerOptions.find(
    (option) => option.audioUrl,
  )

  useEffect(() => {
    setIsQuestionComplete(false)
    setShowSentence(false)
  }, [currentQuestion])

  const handleAnswerChange = (
    questionId: number,
    answerId: number,
    value: string,
  ) => {
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

  const handleNextQuestion = () => {
    if (currentQuestionIndex === currentQuiz?.questions.length! - 1) {
      setIsQuestionComplete(true)
      onComplete()
    } else {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
      setShowSentence(false)
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
                  <Text>{option.optionText}</Text>
                  <Input
                    type="text"
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
                </Box>
              ))}
          </VStack>
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
          isNextDisabled={isNextDisabled}
        />
      )}
    </Box>
  )
}

export default ShortAnswerQuiz
