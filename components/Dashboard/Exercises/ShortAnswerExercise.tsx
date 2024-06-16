import React, { useState, useEffect } from 'react'
import { Button, Box, Text, VStack, Input, Icon } from '@chakra-ui/react'
import { CheckCircleIcon } from '@chakra-ui/icons'
import useQuiz from './utils'

interface ShortAnswerQuizProps {
  lessonId: number
}

const ShortAnswerQuiz: React.FC<ShortAnswerQuizProps> = ({ lessonId }) => {
  const { quizData } = useQuiz(lessonId)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<
    Record<number, Record<number, string>>
  >({})
  const [showSentence, setShowSentence] = useState(false)
  const [isQuestionComplete, setIsQuestionComplete] = useState(false)

  const currentQuestion = quizData?.questions[currentQuestionIndex]

  useEffect(() => {
    setIsQuestionComplete(false)
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

  const handleNextQuestion = () => {
    if (currentQuestionIndex === quizData?.questions.length! - 1) {
      setIsQuestionComplete(true)
    } else {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
      setShowSentence(false)
      setIsQuestionComplete(false)
    }
  }

  const allInputsFilled = currentQuestion?.answerOptions.every(
    (option) => answers[currentQuestion.id]?.[option.id],
  )

  const playAudio = () => {
    if (currentQuestion?.audioUrl) {
      const audio = new Audio(currentQuestion.audioUrl)
      audio.play()
    }
  }

  return (
    <Box>
      {currentQuestion && (
        <Box>
          <Text fontSize="xl">{currentQuestion.text}</Text>
          {currentQuestion.audioUrl && (
            <Button onClick={playAudio}>Play Audio</Button>
          )}
          <VStack spacing={4} mt={4} align="start">
            {currentQuestion.answerOptions.map((option) => (
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
          {showSentence && currentQuestion.extraOptions ? (
            <Box mt={4}>
              {currentQuestion.extraOptions &&
                currentQuestion.extraOptions[0] && (
                  <Text mt={2}>
                    {currentQuestion.extraOptions[0].optionText}
                  </Text>
                )}
              {currentQuestionIndex === quizData!.questions.length - 1 && (
                <Button onClick={handleNextQuestion} mt={2} variant="brandBold">
                  Next
                </Button>
              )}
            </Box>
          ) : (
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
      {isQuestionComplete && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={1}
          backgroundColor="rgba(255, 255, 255, 0.8)"
          padding={4}
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={CheckCircleIcon} color="green.500" boxSize={8} mr={2} />
          <Box fontWeight="bold" fontSize="xl">
            Good Job!
          </Box>
        </Box>
      )}
      {quizData && quizData.questions && (
        <Box mt={4}>
          <Button
            onClick={() =>
              setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
            }
            mr={4}
            isDisabled={currentQuestionIndex === 0}
            variant="brandGhost"
          >
            Previous
          </Button>
          {currentQuestionIndex === quizData.questions.length - 1 && (
            <Button
              onClick={handleNextQuestion}
              isDisabled={!showSentence}
              variant="brandBold"
            >
              Finish Quiz
            </Button>
          )}
        </Box>
      )}
    </Box>
  )
}

export default ShortAnswerQuiz
