import React, { useState } from 'react'
import { Box, Text, Button, Flex, Alert, AlertIcon } from '@chakra-ui/react'
import { Lesson } from '../Course/courseTypes'
import { lessonTypeComponentMap } from './utils'
import DragAndDropExercise from '../Exercises/DragAndDropExercise/DragAndDropExercise'
import MultipleChoiceExercise from '../Exercises/MultipleChoiceExercise'
import ShortAnswerExercise from '../Exercises/ShortAnswerExercise'
import SymbolExercise from '../Exercises/SymbolExercise'

type LessonContainerProps = {
  lesson: Lesson
}

const LessonContainerV3: React.FC<LessonContainerProps> = ({ lesson }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

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

  console.log(steps, 'steps')
  console.log(currentStep, 'currentStep')

  const getCurrentResourceIndex = () => {
    return (
      steps
        .slice(0, currentStepIndex + 1)
        .filter((step) => step.type === 'resource').length - 1
    )
  }

  const getCurrentQuizIndex = () => {
    return (
      steps
        .slice(0, currentStepIndex + 1)
        .filter((step) => step.type === 'quiz').length - 1
    )
  }

  const renderStepContent = () => {
    switch (currentStep.type) {
      case 'video':
        return lesson.videoUrl ? lessonTypeComponentMap['video'](lesson) : null
      case 'resource':
        const resourceIndex = getCurrentResourceIndex()
        const resource = lesson.resources[resourceIndex]
        return resource ? (
          <Box>
            <iframe
              width="95%"
              height="500px"
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                resource.url,
              )}&embedded=true`}
              title={resource.name}
              allowFullScreen
            ></iframe>
          </Box>
        ) : null
      case 'description':
        return lesson.description ? <Text>{lesson.description}</Text> : null
      case 'quiz':
        const quizIndex = getCurrentQuizIndex()
        const quiz = lesson.quiz[quizIndex]
        console.log(quiz, quizIndex)
        return quiz ? (
          <Box>
            {(() => {
              switch (quiz.quizType) {
                case 'dragAndDrop':
                  return (
                    <DragAndDropExercise
                      lessonId={lesson.id}
                      quizIndex={quizIndex}
                    />
                  )
                case 'shortAnswer':
                  return (
                    <ShortAnswerExercise
                      lessonId={lesson.id}
                      quizIndex={quizIndex}
                    />
                  )
                case 'multipleChoice':
                  return (
                    <MultipleChoiceExercise
                      lessonId={lesson.id}
                      quizIndex={quizIndex}
                    />
                  )
                case 'symbolQuiz':
                  return (
                    <SymbolExercise
                      lessonTitle={lesson.title}
                      quizIndex={quizIndex}
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
    <Box w="100%" h="100%" p={10} pl={0} overflowY="auto">
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
      <Box w="92%" mr="auto" ml="auto" mt="8">
        {renderStepContent()}
        <Flex justifyContent="space-between" mt={4}>
          <Button
            onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
            isDisabled={currentStepIndex === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() => setCurrentStepIndex(currentStepIndex + 1)}
            isDisabled={currentStepIndex === steps.length - 1}
          >
            Next
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}

export default LessonContainerV3
