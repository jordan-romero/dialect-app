/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect, useMemo } from 'react'
import {
  Button,
  Box,
  Text,
  SimpleGrid,
  Icon,
  Flex,
  useToast,
} from '@chakra-ui/react'
import { CheckCircleIcon } from '@chakra-ui/icons'
import { MdVolumeUp } from 'react-icons/md'
import useQuiz from './utils'
import { AnswerOption } from './QuizTypes'
import QuizNavigation from './QuizNavigation'

interface MultipleChoiceQuizProps {
  lessonId: number
  quizIndex: number
  onComplete: () => void
}

const AudioButton: React.FC<{ audioUrl: string }> = ({ audioUrl }) => {
  const [audio] = useState(new Audio(audioUrl))

  const playAudio = () => {
    audio.play()
  }

  return (
    <Button onClick={playAudio} size="sm" leftIcon={<MdVolumeUp />}>
      Play Audio
    </Button>
  )
}

const MultipleChoiceQuiz: React.FC<MultipleChoiceQuizProps> = ({
  lessonId,
  quizIndex,
  onComplete,
}) => {
  const { quizzes } = useQuiz(lessonId)
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({})
  const [currentPart, setCurrentPart] = useState(1)
  const [shuffledPart1Questions, setShuffledPart1Questions] = useState<any[]>(
    [],
  )
  const [shuffledPart2Questions, setShuffledPart2Questions] = useState<any[]>(
    [],
  )
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const quizData = useMemo(() => {
    console.log('🎲 Quiz Selection:', {
      foundQuizzes: quizzes?.length,
      targetIndex: quizIndex,
      quizzes: quizzes?.map((q) => ({
        id: q.id,
        order: q.order,
        type: q.quizType,
      })),
    })
    return quizzes?.find((quiz) => quiz.order === quizIndex)
  }, [quizzes, quizIndex])

  useEffect(() => {
    console.log('🎯 Questions Data:', {
      hasQuizData: !!quizData,
      questionsCount: quizData?.questions?.length,
      questions: quizData?.questions?.map((q) => ({
        id: q.id,
        text: q.text,
        answerOptionsCount: q.answerOptions?.length,
      })),
    })

    if (quizData?.questions) {
      const part1 = quizData.questions.filter(
        (question) => question.categories?.[0] !== undefined,
      )
      const part2 = quizData.questions.filter(
        (question) => question.categories?.[0] === undefined,
      )

      console.log('📝 Parts Debug:', {
        part1Count: part1.length,
        part2Count: part2.length,
        shuffledPart1: shuffledPart1Questions.length,
        shuffledPart2: shuffledPart2Questions.length,
      })

      setShuffledPart1Questions(part1)
      setShuffledPart2Questions(part2)
    }
  }, [quizData?.questions])

  // Log render state
  console.log('🎨 Render State:', {
    hasQuizzes: quizzes?.length > 0,
    hasQuizData: !!quizData,
    part1Questions: shuffledPart1Questions.length,
    part2Questions: shuffledPart2Questions.length,
  })

  const getMultipleChoiceQuiz = () => {
    return quizzes.find((quiz) => quiz.quizType === 'multipleChoice')
  }

  const multipleChoiceQuiz = getMultipleChoiceQuiz()
  console.log('🎯 Multiple choice quiz:', multipleChoiceQuiz)

  // Load saved progress when component mounts
  useEffect(() => {
    const loadProgress = async () => {
      if (!multipleChoiceQuiz) return

      try {
        const response = await fetch(
          `/api/userQuizProgress?quizId=${multipleChoiceQuiz.id}&lessonId=${lessonId}`,
        )
        if (response.ok) {
          const data = await response.json()
          setIsCompleted(data.isCompleted)

          // Restore saved answers
          if (data.answers && data.answers.length > 0) {
            const savedAnswers: Record<number, number> = {}
            data.answers.forEach((answer: any) => {
              savedAnswers[answer.questionId] = parseInt(answer.textAnswer)
            })
            setSelectedAnswers(savedAnswers)
          }
        }
      } catch (error) {
        console.error('Error loading quiz progress:', error)
      }
    }

    loadProgress()
  }, [multipleChoiceQuiz, lessonId])

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffledArray = [...array]
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ]
    }
    return shuffledArray
  }

  const handleAnswerSelect = (questionId: number, answerId: number) => {
    setSelectedAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answerId,
    }))
  }

  const isQuestionCorrect = (questionId: number) => {
    const selectedAnswer = selectedAnswers[questionId]
    const question = multipleChoiceQuiz?.questions.find(
      (q) => q.id === questionId,
    )
    const correctOption = question?.answerOptions.find(
      (option) => option.isCorrect,
    )
    return selectedAnswer === correctOption?.id
  }

  const underlineText = (text: string, category: string) => {
    if (category === 'Last Two') {
      return (
        <Text as="span">
          {text.slice(0, -2)}
          <Text as="u">{text.slice(-2)}</Text>
        </Text>
      )
    } else if (category === 'Last Three') {
      return (
        <Text as="span">
          {text.slice(0, -3)}
          <Text as="u">{text.slice(-3)}</Text>
        </Text>
      )
    } else if (category === 'First') {
      return (
        <Text as="span">
          <Text as="u">{text.slice(0, 1)}</Text>
          {text.slice(1)}
        </Text>
      )
    } else if (category === 'First Two') {
      return (
        <Text as="span">
          <Text as="u">{text.slice(0, 2)}</Text>
          {text.slice(2)}
        </Text>
      )
    }
    return text
  }

  const handlePreviousPart = () => {
    if (currentPart === 2) {
      setCurrentPart(1)
    }
  }

  const handleNextPart = () => {
    if (currentPart === 1) {
      setCurrentPart(2)
    }
  }

  const handleFinish = async () => {
    await submitQuiz()
    onComplete()
  }

  const submitQuiz = async () => {
    if (!multipleChoiceQuiz) return

    setIsLoading(true)
    try {
      // Prepare answers in the format expected by the API
      const answersToSubmit = Object.entries(selectedAnswers).map(
        ([questionId, answerId]) => ({
          questionId: parseInt(questionId),
          textAnswer: answerId.toString(),
        }),
      )

      const response = await fetch('/api/submitQuiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: multipleChoiceQuiz.id,
          lessonId: lessonId,
          answers: answersToSubmit,
        }),
      })

      if (response.ok) {
        setIsCompleted(true)
        toast({
          title: 'Quiz Completed!',
          description: 'Your answers have been saved successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
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
      toast({
        title: 'Error',
        description: 'Failed to save your answers. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isPartComplete = (part: number) => {
    const questions =
      part === 1 ? shuffledPart1Questions : shuffledPart2Questions
    return questions.every((question) => selectedAnswers[question.id])
  }

  const renderQuestion = (question: any) => (
    <Box key={question.id} mb={8} width="100%">
      <Flex alignItems="center" mb={4}>
        <Text fontWeight="bold" mr={4} fontSize="2xl">
          {question.categories && question.categories.length > 0
            ? underlineText(question.text, question.categories[0])
            : question.text}
        </Text>
        {question.audioUrl && <AudioButton audioUrl={question.audioUrl} />}
      </Flex>
      <SimpleGrid columns={2} spacing={4} width="100%">
        {question.answerOptions.map((option: AnswerOption) => (
          <Button
            key={option.id}
            onClick={() => handleAnswerSelect(question.id, option.id)}
            fontFamily="'Charis SIL', serif"
            variant={
              selectedAnswers[question.id] === option.id ? 'solid' : 'outline'
            }
            colorScheme={
              selectedAnswers[question.id] === option.id
                ? isQuestionCorrect(question.id)
                  ? 'green'
                  : 'red'
                : 'gray'
            }
          >
            {option.optionText}
            {selectedAnswers[question.id] === option.id &&
              isQuestionCorrect(question.id) && (
                <Icon
                  as={CheckCircleIcon}
                  color="green.500"
                  ml={2}
                  boxSize={4}
                />
              )}
          </Button>
        ))}
      </SimpleGrid>
    </Box>
  )

  return (
    <Box>
      <Box
        position="sticky"
        top="0"
        bg="white"
        zIndex="1"
        py={4}
        borderColor="gray.200"
      >
        <Text fontStyle="italic" mb={4}>
          {currentPart === 1
            ? 'Instructions: Choose the correct symbol that matches the sound in the underlined part of the word. Click the "Play Audio" button to hear the word.'
            : 'Instructions: Choose the correct word that contains the sound of the presented symbol. Click the "Play Audio" button to hear the symbol.'}
        </Text>
        {currentPart === 1 && (
          <Text fontFamily="'Charis SIL', serif" mb={8}>
            Note, when doing these exercises you may be tempted to check a
            dictionary to "help" you with these answers – we caution you that
            the transcription might be more "broad" than what we are teaching
            you, therefore not as helpful. When in doubt, check the "Expanded
            Lexical Sets" worksheet from section 2.
          </Text>
        )}
      </Box>
      {currentPart === 1 && shuffledPart1Questions.map(renderQuestion)}
      {currentPart === 2 && shuffledPart2Questions.map(renderQuestion)}
      {isCompleted && (
        <Box mt={4} p={4} bg="green.100" borderRadius="md">
          <Text color="green.800" fontWeight="bold">
            ✓ Quiz completed! Your answers have been saved.
          </Text>
        </Box>
      )}
      <QuizNavigation
        currentQuestion={currentPart}
        totalQuestions={2}
        onPrevious={handlePreviousPart}
        onNext={handleNextPart}
        onFinish={handleFinish}
        isNextDisabled={
          !isPartComplete(currentPart) || isLoading || isCompleted
        }
      />
    </Box>
  )
}

export default MultipleChoiceQuiz
