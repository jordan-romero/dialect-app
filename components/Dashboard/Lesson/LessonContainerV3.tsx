import React, { useState } from 'react'
import { Box, Text, Button, Flex, Alert, AlertIcon } from '@chakra-ui/react'
import { Lesson } from '../Course/courseTypes'
import { lessonTypeComponentMap } from './utils'
import DragAndDropExercise from '../Exercises/DragAndDropExercise/DragAndDropExercise'
import MultipleChoiceExercise from '../Exercises/MultipleChoiceExercise'
import ShortAnswerExercise from '../Exercises/ShortAnswerExercise'
import SymbolExercise from '../Exercises/SymbolExercise'
import LessonDescription from './LessonDescription'

type LessonContainerProps = {
  lesson: Lesson
  onLessonComplete: () => void // Callback function to be called when lesson is complete
}

const LessonContainerV3: React.FC<LessonContainerProps> = ({
  lesson,
  onLessonComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)

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
    console.log(currentResource, 'currentResource')
    return currentResource
  }

  const getCurrentQuizIndex = () => {
    return (
      steps
        .slice(0, currentStepIndex + 1)
        .filter((step) => step.type === 'quiz').length - 1
    )
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

      const result = await response.json()
      console.log('Lesson marked as complete:', result)

      // Call onLessonComplete to update the parent state immediately
      onLessonComplete()
    } catch (error) {
      console.error('Error marking lesson as complete:', error)
    } finally {
      setIsMarkingComplete(false)
    }
  }

  const handleQuizCompletion = () => {
    setQuizCompleted(true)
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
      case 'quiz':
        const quizIndex = getCurrentQuizIndex()
        const quiz = lesson.quiz[quizIndex]
        return quiz ? (
          <Box>
            {(() => {
              switch (quiz.quizType) {
                case 'dragAndDrop':
                  return (
                    <DragAndDropExercise
                      lessonId={lesson.id}
                      quizIndex={quizIndex}
                      onComplete={handleQuizCompletion}
                    />
                  )
                case 'shortAnswer':
                  return (
                    <ShortAnswerExercise
                      lessonId={lesson.id}
                      quizIndex={quizIndex}
                      onComplete={handleQuizCompletion}
                    />
                  )
                case 'multipleChoice':
                  return (
                    <MultipleChoiceExercise
                      lessonId={lesson.id}
                      quizIndex={quizIndex}
                      onComplete={handleQuizCompletion}
                    />
                  )
                case 'symbolQuiz':
                  return (
                    <SymbolExercise
                      lessonTitle={lesson.title}
                      quizIndex={quizIndex}
                      onComplete={handleQuizCompletion}
                    />
                  )
                default:
                  return null
              }
            })()}
          </Box>
        ) : null
      default:
        return null
    }
  }

  return (
    <Box w="100%" h="100vh" p={10} pl={0} overflowY="auto">
      {/* Lesson Title */}
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
          {currentStepIndex > 0 && (
            <Button
              onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
              isDisabled={currentStepIndex === 0}
            >
              Previous
            </Button>
          )}
          {currentStepIndex < steps.length - 1 ? (
            <Button
              onClick={() => setCurrentStepIndex(currentStepIndex + 1)}
              isDisabled={
                currentStepIndex === steps.length - 1 ||
                (currentStep.type === 'quiz' && !quizCompleted)
              }
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={markLessonComplete}
              isLoading={isMarkingComplete}
              isDisabled={isMarkingComplete}
            >
              Finish
            </Button>
          )}
        </Flex>
      </Box>
    </Box>
  )
}

export default LessonContainerV3
