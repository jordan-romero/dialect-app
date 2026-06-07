import React, { useState, useEffect, useMemo, useRef } from 'react'
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
import { ConsonantRectangleExercise } from '../Exercises/ConsonantRectangleExercise'
import { RepeatAfterMeExercise } from '../Exercises/RepeatAfterMeExercise'
import { QuizCelebration } from '../Exercises/QuizCelebration'
import IframeWithSkeleton from './IframeWithSkeleton'
import { CorrectionsExercise } from '../Exercises/CorrectionsExercise'
import { LexicalChartExercise } from '../Exercises/LexicalChartExercise'
import { HangmanIPAExercise } from '../Exercises/HangmanIPAExercise'
import UnlockCourseButton from '../../UnlockCourseButton'
import { expandLessonSteps, orderedResources } from './lessonOutline'

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
  /** File-based quizzes (e.g. vowel quad) report when all answers are correct so we can unlock Next */
  const [fileBasedQuizAllCorrect, setFileBasedQuizAllCorrect] = useState<
    Set<number>
  >(new Set())
  // Bumped per quiz to force a fresh remount on "Try again".
  const [retryNonce, setRetryNonce] = useState<{ [quizId: number]: number }>({})
  // Quiz id currently showing the completion celebration (Siri-style pulse).
  const [celebratingQuizId, setCelebratingQuizId] = useState<number | null>(
    null,
  )

  const quizIdsKey = useMemo(
    () => (lesson.quiz?.length ? lesson.quiz.map((q) => q.id).join(',') : ''),
    [lesson.quiz],
  )

  const lessonRef = useRef(lesson)
  lessonRef.current = lesson

  // Load quiz completion status from database
  useEffect(() => {
    const loadQuizCompletionStatus = async () => {
      const quizzes = lessonRef.current.quiz
      if (!quizzes || quizzes.length === 0) return

      try {
        const completionPromises = quizzes.map(async (quiz) => {
          const response = await fetch(
            `/api/userQuizProgress?quizId=${quiz.id}&lessonId=${lessonRef.current.id}`,
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
        const completedOrders = quizzes
          .filter((quiz) => completionMap[quiz.id])
          .map((quiz) => quiz.order)
        setCompletedQuizzes(completedOrders)
      } catch (error) {
        console.error('Error loading quiz completion status:', error)
      }
    }

    loadQuizCompletionStatus()
  }, [lesson.id, quizIdsKey])

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

  // Expand the stored outline into the concrete sequence the learner walks
  // through — one resource per resource step, in authored order — so Next moves
  // through each resource, video, and quiz one at a time.
  const steps = expandLessonSteps(lesson)
  const resources = orderedResources(lesson)
  const currentStep = steps[currentStepIndex] ?? steps[0]

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
      // Same celebration for every quiz type across the platform.
      setCelebratingQuizId(quiz.id)
    }
    // Re-check badges (a completed exercise may have earned one).
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('badges:check'))
    }
  }

  // "Try again": clear the saved answers for this quiz, reset local completion,
  // and force the quiz component to remount fresh.
  const handleRetryQuiz = async (quiz: { id: number; order: number }) => {
    try {
      await fetch('/api/resetQuizProgress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: quiz.id }),
      })
    } catch (error) {
      console.error('Error resetting quiz:', error)
    }
    setQuizCompletionStatus((prev) => ({ ...prev, [quiz.id]: false }))
    setCompletedQuizzes((prev) => prev.filter((o) => o !== quiz.order))
    setFileBasedQuizAllCorrect((prev) => {
      const next = new Set(prev)
      next.delete(quiz.order)
      return next
    })
    setRetryNonce((prev) => ({ ...prev, [quiz.id]: (prev[quiz.id] || 0) + 1 }))
    setCelebratingQuizId((cur) => (cur === quiz.id ? null : cur))
  }

  const renderStepContent = () => {
    switch (currentStep.type) {
      case 'video':
        return lesson.videoUrl ? lessonTypeComponentMap['video'](lesson) : null
      case 'resource': {
        // Show ONLY the single resource that belongs to this step.
        const r = resources[currentStep.resourceIndex ?? 0]
        if (!r) return null
        const isAudio = r.type === 'mp3' || /\.(mp3|wav)(\?|$)/i.test(r.url)
        const isLink = r.type === 'link'
        return (
          <Box height="100%" overflowY="auto">
            <Box mb={8}>
              <Text fontWeight="bold" mb={2}>
                {r.name}
              </Text>
              {isAudio ? (
                <audio controls style={{ width: '100%' }} src={r.url} />
              ) : isLink ? (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#5F53CF', textDecoration: 'underline' }}
                >
                  Open resource ↗
                </a>
              ) : (
                <IframeWithSkeleton
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                    r.url,
                  )}&embedded=true`}
                  title={r.name}
                  height="750px"
                />
              )}
            </Box>
          </Box>
        )
      }
      case 'description':
        return <LessonDescription lesson={lesson} />
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
          <Paper
            key={`${currentQuiz.id}-${retryNonce[currentQuiz.id] || 0}`}
            position="relative"
          >
            {celebratingQuizId === currentQuiz.id && (
              <QuizCelebration
                onDone={() => setCelebratingQuizId(null)}
                subtitle={`${currentQuiz.title?.trim() || 'Quiz'} complete`}
              />
            )}
            <Flex justify="space-between" align="center" mb={2} gap={3}>
              <Text fontSize="lg" fontWeight="bold" color="gray.700">
                {currentQuiz.title?.trim() || ''}
              </Text>
              {/* Try again only appears once the quiz has been completed. */}
              {(quizCompletionStatus[currentQuiz.id] ||
                completedQuizzes.includes(currentQuiz.order) ||
                fileBasedQuizAllCorrect.has(currentQuiz.order)) && (
                <Button
                  size="sm"
                  variant="ghost"
                  flexShrink={0}
                  onClick={() =>
                    handleRetryQuiz({
                      id: currentQuiz.id,
                      order: currentQuiz.order,
                    })
                  }
                >
                  ↻ Try again
                </Button>
              )}
            </Flex>
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
                      onAllCorrectChange={(allCorrect) => {
                        setFileBasedQuizAllCorrect((prev) => {
                          const next = new Set(prev)
                          if (allCorrect) next.add(currentQuiz.order)
                          else next.delete(currentQuiz.order)
                          return next
                        })
                      }}
                    />
                  )
                case 'corrections':
                  return (
                    <CorrectionsExercise
                      lessonId={lesson.id}
                      quizIndex={currentQuiz.order}
                      onComplete={() => handleQuizCompletion(currentQuiz.order)}
                      onAllCorrectChange={(allCorrect) => {
                        setFileBasedQuizAllCorrect((prev) => {
                          const next = new Set(prev)
                          if (allCorrect) next.add(currentQuiz.order)
                          else next.delete(currentQuiz.order)
                          return next
                        })
                      }}
                    />
                  )
                case 'repeatAfterMe':
                  return (
                    <RepeatAfterMeExercise
                      lessonId={lesson.id}
                      quizIndex={currentQuiz.order}
                      onComplete={() => handleQuizCompletion(currentQuiz.order)}
                    />
                  )
                case 'consonantRect':
                  return (
                    <ConsonantRectangleExercise
                      lessonId={lesson.id}
                      quizIndex={currentQuiz.order}
                      onComplete={() => handleQuizCompletion(currentQuiz.order)}
                      onAllCorrectChange={(allCorrect) => {
                        setFileBasedQuizAllCorrect((prev) => {
                          const next = new Set(prev)
                          if (allCorrect) next.add(currentQuiz.order)
                          else next.delete(currentQuiz.order)
                          return next
                        })
                      }}
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
                case 'buildAWord':
                  // Build-a-Word is mechanically identical to Hangman ("hangman
                  // minus the hanged man") — reuse the component with its own data.
                  return (
                    <HangmanIPAExercise
                      lessonId={lesson.id}
                      quizIndex={currentQuiz.order}
                      onComplete={() => handleQuizCompletion(currentQuiz.order)}
                      dataUrl="/buildAWordData.json"
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
      completedQuizzes.includes(currentQuiz.order) ||
      fileBasedQuizAllCorrect.has(currentQuiz.order)
    : true
  const isFinishButtonDisabled =
    isLastStep && currentStep.type === 'quiz' ? !isCurrentQuizCompleted : false

  // Paid-content gate: gated lessons come back from the API with `locked: true`
  // and their content stripped. Show a paywall instead of the lesson.
  if ((lesson as any).locked) {
    return (
      <Box w="100%" h="100%" p={10} pl={0} overflowY="auto">
        <Flex
          direction="column"
          align="center"
          justify="center"
          h="100%"
          textAlign="center"
          gap={5}
        >
          <Text fontSize="2xl" fontWeight="bold">
            🔒 {lesson.title?.trim()}
          </Text>
          {(lesson as any).lockReason === 'phase' ? (
            <Text maxW="480px" color="gray.600">
              This phase is locked. Finish <b>every</b> lesson in the previous
              phase to unlock it.
            </Text>
          ) : (
            <>
              <Text maxW="480px" color="gray.600">
                This lesson is part of the full course. The first three lessons
                are free — unlock the rest to access all videos, handouts, and
                exercises.
              </Text>
              <UnlockCourseButton />
            </>
          )}
        </Flex>
      </Box>
    )
  }

  return (
    <Box w="100%" h="100%" p={10} pl={0} overflowY="auto">
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
