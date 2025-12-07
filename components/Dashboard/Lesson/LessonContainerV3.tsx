import React, { useState, useEffect } from 'react'
import { Box, Text, Button, Flex, Alert, AlertIcon } from '@chakra-ui/react'
import { Lesson } from '../Course/courseTypes'
import { lessonTypeComponentMap } from './utils'
import DragAndDropExercise from '../Exercises/DragAndDropExercise/DragAndDropExercise'
import MultipleChoiceExercise from '../Exercises/MultipleChoiceExercise'
import ShortAnswerExercise from '../Exercises/ShortAnswerExercise'
import SymbolExercise from '../Exercises/SymbolExercise'
import LessonDescription from './LessonDescription'
import Paper from '../../theme/Paper'
import LessonOutro from './LessonOutro'
import { VowelQuadrilateralExercise } from '../Exercises/VowelQuadrilateral'
import { LexicalChartExercise } from '../Exercises/LexicalChartExercise'
import { HangmanIPAExercise } from '../Exercises/HangmanIPAExercise'

type LessonContainerProps = {
  lesson: Lesson
  onLessonComplete: () => void
}

const LessonContainerV3: React.FC<LessonContainerProps> = ({
  lesson,
  onLessonComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)
  const [completedQuizzes, setCompletedQuizzes] = useState<number[]>([])
  const [quizCompletionStatus, setQuizCompletionStatus] = useState<{
    [quizId: number]: boolean
  }>({})

  // Load quiz completion status from database
  useEffect(() => {
    const loadQuizCompletionStatus = async () => {
      if (!lesson.quiz || lesson.quiz.length === 0) return

      try {
        const completionPromises = lesson.quiz.map(async (quiz) => {
          const response = await fetch(
            `/api/userQuizProgress?quizId=${quiz.id}&lessonId=${lesson.id}`,
          )
          if (response.ok) {
            const data = await response.json()
            return { quizId: quiz.id, isCompleted: data.isCompleted }
          }
          return { quizId: quiz.id, isCompleted: false }
        })

        const results = await Promise.all(completionPromises)
        const completionMap = results.reduce((acc, { quizId, isCompleted }) => {
          acc[quizId] = isCompleted
          return acc
        }, {} as { [quizId: number]: boolean })

        setQuizCompletionStatus(completionMap)

        // Also update completedQuizzes for backward compatibility
        const completedOrders = lesson.quiz
          .filter((quiz) => completionMap[quiz.id])
          .map((quiz) => quiz.order)
        setCompletedQuizzes(completedOrders)
      } catch (error) {
        console.error('Error loading quiz completion status:', error)
      }
    }

    loadQuizCompletionStatus()
  }, [lesson.id, lesson.quiz])

  if (!lesson || !lesson.steps || lesson.steps.length === 0) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Alert status="error">
          <AlertIcon />
          No lesson data available
        </Alert>
      </Flex>
    )
  }

  const steps = lesson.steps
  const currentStep = steps[currentStepIndex]

  const getCurrentResourceIndex = () => {
    const currentResource =
      steps
        .slice(0, currentStepIndex + 1)
        .filter((step) => step.type === 'resource').length - 1
    return currentResource
  }

  console.log(lesson.quiz, 'lesson.quiz')
  console.log(
    'Quiz types:',
    lesson.quiz?.map((q) => ({ id: q.id, type: q.quizType, order: q.order })),
  )
  console.log('Lesson steps:', lesson.steps)

  const getCurrentQuiz = () => {
    if (currentStep.type !== 'quiz' || !lesson.quiz) return null

    // Count how many quiz steps we've seen up to current step
    const quizStepsCount = steps
      .slice(0, currentStepIndex + 1)
      .filter((step) => step.type === 'quiz').length

    const currentOrder = quizStepsCount - 1 // This will be 0 for the first quiz
    const quiz = lesson.quiz.find((quiz) => quiz.order === currentOrder)

    console.log('🎲 getCurrentQuiz Debug:', {
      currentStepIndex,
      currentStepType: currentStep.type,
      quizStepsCount,
      currentOrder,
      foundQuiz: quiz,
      allQuizzes: lesson.quiz.map((q) => ({
        id: q.id,
        type: q.quizType?.trim(),
        order: q.order,
      })),
      stepsSlice: steps.slice(0, currentStepIndex + 1),
    })

    return quiz
  }

  const markLessonComplete = async () => {
    setIsMarkingComplete(true)
    try {
      const response = await fetch('/api/updateProgress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonId: lesson.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark lesson as complete')
      }

      await response.json()
      onLessonComplete()
    } catch (error) {
      console.error('Error marking lesson as complete:', error)
    } finally {
      setIsMarkingComplete(false)
    }
  }

  const handleQuizCompletion = (quizOrder: number) => {
    setCompletedQuizzes((prev) => [...prev, quizOrder])

    // Also update the quiz completion status
    const quiz = lesson.quiz?.find((q) => q.order === quizOrder)
    if (quiz) {
      setQuizCompletionStatus((prev) => ({
        ...prev,
        [quiz.id]: true,
      }))
    }
  }

  const renderStepContent = () => {
    switch (currentStep.type) {
      case 'video':
        return lesson.videoUrl ? lessonTypeComponentMap['video'](lesson) : null
      case 'resource':
        const resourceIndex = getCurrentResourceIndex()
        const resource = lesson.resources[resourceIndex]
        return resource ? (
          <Box height="100%">
            <iframe
              width="95%"
              height="750px"
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                resource.url,
              )}&embedded=true`}
              title={resource.name}
              allowFullScreen
            ></iframe>
          </Box>
        ) : null
      case 'description':
        return (
          <LessonDescription
            lessonDescription={lesson.description}
            resources={lesson.resources}
          />
        )
      case 'outro':
        return <LessonOutro resources={lesson.resources} />
      case 'quiz':
        const currentQuiz = getCurrentQuiz()
        console.log('🎯 Quiz rendering debug:', {
          currentQuiz,
          quizType: currentQuiz?.quizType,
          lessonId: lesson.id,
          quizOrder: currentQuiz?.order,
          isQuizNull: currentQuiz === null,
        })
        return currentQuiz ? (
          <Paper>
            {(() => {
              console.log('🎲 Quiz type switch:', currentQuiz.quizType)
              switch (currentQuiz.quizType) {
                case 'dragAndDrop':
                  return (
                    <DragAndDropExercise
                      lessonId={lesson.id}
                      quizIndex={currentQuiz.order}
                      onComplete={() => handleQuizCompletion(currentQuiz.order)}
                    />
                  )
                case 'shortAnswer':
                  return (
                    <ShortAnswerExercise
                      lessonId={lesson.id}
                      quizIndex={currentQuiz.order}
                      onComplete={() => handleQuizCompletion(currentQuiz.order)}
                    />
                  )
                case 'multipleChoice':
                  return (
                    <MultipleChoiceExercise
                      lessonId={lesson.id}
                      quizIndex={currentQuiz.order}
                      onComplete={() => handleQuizCompletion(currentQuiz.order)}
                    />
                  )
                case 'symbolPicker':
                  return (
                    <SymbolExercise
                      lessonId={lesson.id}
                      quizIndex={currentQuiz.order}
                      onComplete={() => handleQuizCompletion(currentQuiz.order)}
                    />
                  )
                case 'vowelQuad':
                  return (
                    <VowelQuadrilateralExercise
                      lessonId={lesson.id}
                      quizIndex={currentQuiz.order}
                      onComplete={() => handleQuizCompletion(currentQuiz.order)}
                    />
                  )
                case 'lexicalChart':
                  return (
                    <LexicalChartExercise
                      lessonId={lesson.id}
                      quizIndex={currentQuiz.order}
                      onComplete={() => handleQuizCompletion(currentQuiz.order)}
                    />
                  )
                case 'hangman':
                  return (
                    <HangmanIPAExercise
                      lessonId={lesson.id}
                      quizIndex={currentQuiz.order}
                      onComplete={() => handleQuizCompletion(currentQuiz.order)}
                    />
                  )
                default:
                  return null
              }
            })()}
          </Paper>
        ) : null
      default:
        return null
    }
  }

  const isLastStep = currentStepIndex === steps.length - 1
  const currentQuiz = currentStep.type === 'quiz' ? getCurrentQuiz() : null
  const isCurrentQuizCompleted = currentQuiz
    ? quizCompletionStatus[currentQuiz.id] ||
      completedQuizzes.includes(currentQuiz.order)
    : true
  const isFinishButtonDisabled =
    isLastStep && currentStep.type === 'quiz' ? !isCurrentQuizCompleted : false

  return (
    <Box w="100%" h="100vh" p={10} pl={0} overflowY="auto">
      <Box
        backgroundImage="linear-gradient(to left, #5F53CF, #7EACE2)"
        w="100%"
        h="100px"
        borderTopEndRadius="full"
        borderBottomEndRadius="full"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Text fontSize="5xl" fontWeight="bold" color="util.white">
          {lesson.title}
        </Text>
      </Box>
      <Box
        w="96%"
        mr="auto"
        ml="auto"
        mt="8"
        minHeight="calc(100vh - 300px)"
        overflowY="auto"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Box flex="1">{renderStepContent()}</Box>
        <Flex justifyContent="space-between" mt={4}>
          <Box>
            {currentStepIndex > 0 && (
              <Button
                onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
                isDisabled={currentStepIndex === 0}
              >
                Previous
              </Button>
            )}
          </Box>
          <Box>
            {!isLastStep ? (
              <Button
                onClick={() => setCurrentStepIndex(currentStepIndex + 1)}
                isDisabled={
                  currentStep.type === 'quiz' && !isCurrentQuizCompleted
                }
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={markLessonComplete}
                isLoading={isMarkingComplete}
                isDisabled={isMarkingComplete || isFinishButtonDisabled}
              >
                Finish
              </Button>
            )}
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}

export default LessonContainerV3
