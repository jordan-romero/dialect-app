import React, { useState, useEffect } from 'react'
import { Box, Button, Flex, Image, VStack, Text } from '@chakra-ui/react'
import vowelChartImage from '@/public/ipaVowelChart.png'
import QuizNavigation from './QuizNavigation'
import { IPAKeyboard } from '../../Community/IPAKeyboard'

interface VowelPosition {
  top: number
  left: number
  vowel: string | null
  isCorrect?: boolean
}

interface VowelQuadrilateralData {
  id: number
  lessonId: number
  score: number | null
  passScore: number
  hasBeenAttempted: boolean
  quizType: string
  questions: Array<{
    id: number
    text: string
    questionType: string
    quizId: number
    answerOptions: any[]
    extraOptions: any[]
    categories: any[]
    audioUrl: string | null
  }>
  answerOptions: any[]
  order: number
  vowelPositions: { [key: string]: VowelPosition }
  availableVowels: string[]
}

interface VowelQuadrilateralExerciseProps {
  lessonId: number
  quizIndex: number
  onComplete: () => void
}

export const VowelQuadrilateralExercise: React.FC<
  VowelQuadrilateralExerciseProps
> = ({ lessonId, quizIndex, onComplete }) => {
  const [selectedVowel, setSelectedVowel] = useState<string | null>(null)
  const [vowelPositions, setVowelPositions] = useState<{
    [key: string]: VowelPosition
  }>({})
  const [availableVowels, setAvailableVowels] = useState<string[]>([])
  const [quizData, setQuizData] = useState<VowelQuadrilateralData | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isQuizComplete, setIsQuizComplete] = useState(false)

  // Load quiz data from JSON file
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        console.log('Loading vowel quadrilateral data...')
        const response = await fetch('/vowelQuadrilateralData.json')
        const data: VowelQuadrilateralData = await response.json()
        console.log('Loaded vowel quadrilateral data:', data)
        setQuizData(data)
        setAvailableVowels(data.availableVowels)

        // Initialize vowel positions without the correct vowels
        const initialPositions: { [key: string]: VowelPosition } = {}
        Object.entries(data.vowelPositions).forEach(([key, position]) => {
          initialPositions[key] = {
            top: position.top,
            left: position.left,
            vowel: null,
            isCorrect: position.isCorrect,
          }
        })
        setVowelPositions(initialPositions)
        console.log('Initialized vowel positions:', initialPositions)
      } catch (error) {
        console.error('Error loading vowel quadrilateral data:', error)
      }
    }

    loadQuizData()
  }, [])

  // Load saved progress and restore vowel positions
  useEffect(() => {
    const loadProgress = async () => {
      if (!quizData) return

      try {
        const response = await fetch(
          `/api/userQuizProgress?quizId=${quizData.id}&lessonId=${lessonId}`,
        )
        if (response.ok) {
          const data = await response.json()
          setIsCompleted(data.isCompleted)

          // Restore saved vowel positions if available
          if (data.answers && data.answers.length > 0) {
            const savedAnswer = data.answers.find(
              (answer: any) => answer.questionId === quizData.questions[0]?.id,
            )
            if (
              savedAnswer &&
              savedAnswer.textAnswer &&
              savedAnswer.textAnswer !== 'pending'
            ) {
              try {
                const savedPositions = JSON.parse(savedAnswer.textAnswer)
                setVowelPositions(savedPositions)
              } catch (error) {
                console.error('Error parsing saved vowel positions:', error)
                // If parsing fails, keep the default empty positions
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading quiz progress:', error)
      }
    }

    loadProgress()
  }, [quizData, lessonId])

  const handleVowelClick = (position: string) => {
    if (selectedVowel) {
      // Place or replace the vowel
      setVowelPositions((prev) => ({
        ...prev,
        [position]: { ...prev[position], vowel: selectedVowel },
      }))
      setSelectedVowel(null) // Reset selection after placing
    } else if (vowelPositions[position].vowel) {
      // Clear the position if no vowel is selected and position has a vowel
      setVowelPositions((prev) => ({
        ...prev,
        [position]: { ...prev[position], vowel: null },
      }))
    }
  }

  const handleVowelSelect = (vowel: string) => {
    setSelectedVowel(vowel)
  }

  const checkQuizCompletion = () => {
    if (!quizData) return false

    // Check if all positions with isCorrect: true have the correct vowel placed
    return Object.entries(quizData.vowelPositions).every(
      ([key, correctPosition]) => {
        if (correctPosition.isCorrect) {
          const userPosition = vowelPositions[key]
          return userPosition.vowel === correctPosition.vowel
        }
        return true
      },
    )
  }

  const handleFinish = async () => {
    await submitQuiz()
    onComplete()
  }

  const submitQuiz = async () => {
    if (!quizData) return

    setIsLoading(true)
    try {
      // Prepare answers - for vowel quadrilateral, we'll save the current state
      const answersToSubmit = quizData.questions.map((question) => ({
        questionId: question.id,
        textAnswer: JSON.stringify(vowelPositions), // Save the current vowel positions as JSON
      }))

      console.log('Submitting vowel quadrilateral quiz:', {
        quizId: quizData.id,
        lessonId: lessonId,
        answers: answersToSubmit,
        vowelPositions,
      })

      const response = await fetch('/api/submitQuiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: quizData.id,
          lessonId: lessonId,
          answers: answersToSubmit,
        }),
      })

      if (response.ok) {
        setIsCompleted(true)
        setIsQuizComplete(true)
        console.log('Vowel quadrilateral quiz submitted successfully')
      } else {
        console.error('Failed to submit quiz')
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isQuizValid = checkQuizCompletion()

  if (!quizData) {
    return <Text>Loading vowel quadrilateral quiz...</Text>
  }

  return (
    <VStack spacing={4} align="center">
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        {quizData.questions[0]?.text ||
          'Place the correct vowel symbols on the IPA vowel chart'}
      </Text>

      <Box position="relative" maxW="800px" w="full">
        <Image
          src={'/vowelChart.png'}
          alt="IPA Vowel Chart"
          width="100%"
          height="auto"
        />

        {Object.entries(vowelPositions).map(([key, position]) => {
          const correctPosition = quizData.vowelPositions[key]
          const isCorrect = position.vowel === correctPosition.vowel
          const isWrong =
            position.vowel && position.vowel !== correctPosition.vowel

          return (
            <Box
              key={key}
              position="absolute"
              top={`${position.top}%`}
              left={`${position.left}%`}
              w="30px"
              h="30px"
              bg={position.vowel ? 'white' : 'rgba(255, 255, 255, 0.5)'}
              border="2px solid"
              borderColor={
                isCorrect
                  ? 'green.500'
                  : isWrong
                  ? 'red.500'
                  : selectedVowel
                  ? 'teal.500'
                  : 'gray.300'
              }
              borderRadius="full"
              display="flex"
              justifyContent="center"
              alignItems="center"
              fontWeight="bold"
              cursor="pointer"
              onClick={() => handleVowelClick(key)}
            >
              {position.vowel}
            </Box>
          )
        })}
      </Box>

      <IPAKeyboard
        customSymbols={availableVowels}
        onSymbolClick={handleVowelSelect}
        showTextArea={false}
        compact={true}
        hideInstructions={false}
        title="Vowel Bank"
      />

      {/* Instructions */}
      <Box
        bg="gray.50"
        p={3}
        borderRadius="lg"
        border="1px solid"
        borderColor="gray.200"
      >
        <Text fontSize="sm" color="black">
          <Text as="span" fontWeight="bold">
            Instructions:
          </Text>{' '}
          Click on a vowel from the bank above, then click on a position on the
          chart to place it. Click on a vowel again to replace an existing
          vowel. Click on an empty position to clear it.
        </Text>
      </Box>

      {isCompleted && (
        <Box mt={4} p={4} bg="green.100" borderRadius="md">
          <Text color="green.800" fontWeight="bold">
            ✓ Quiz completed! Your answers have been saved.
          </Text>
        </Box>
      )}

      <QuizNavigation
        currentQuestion={1}
        totalQuestions={1}
        onPrevious={() => {}}
        onNext={() => {}}
        onFinish={handleFinish}
        isNextDisabled={!isQuizValid || isLoading || isCompleted}
      />
    </VStack>
  )
}

// Keep the old component for backward compatibility
export const VowelQuadrilateral: React.FC = () => {
  return (
    <VowelQuadrilateralExercise
      lessonId={1}
      quizIndex={0}
      onComplete={() => {}}
    />
  )
}
