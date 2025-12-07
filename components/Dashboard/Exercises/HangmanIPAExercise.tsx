import React, { useState, useEffect, useCallback, Fragment } from 'react'
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Flex,
  Badge,
  Tooltip,
  IconButton,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react'
import { Icon } from '@chakra-ui/react'
import { MdKeyboard } from 'react-icons/md'
import QuizNavigation from './QuizNavigation'
import { IPAKeyboard } from '../../Community/IPAKeyboard'

interface HangmanQuestion {
  id: number
  word: string
  blanks: number
  correctAnswer: string[]
}

interface HangmanQuizData {
  id: number
  lessonId: number
  quizType: string
  questions: Array<{
    id: number
    text: string
    questionType: string
    quizId: number
  }>
  symbolBank: string[]
  symbolBankCategories?: {
    consonants?: string[]
    monophthongs?: string[]
    diphthongs?: string[]
    triphthongs?: string[]
    diacritics?: string[]
  }
  questions_data: HangmanQuestion[]
}

interface HangmanIPAExerciseProps {
  lessonId: number
  quizIndex: number
  onComplete: () => void
}

export const HangmanIPAExercise: React.FC<HangmanIPAExerciseProps> = ({
  lessonId,
  quizIndex,
  onComplete,
}) => {
  const [quizData, setQuizData] = useState<HangmanQuizData | null>(null)
  const [userAnswers, setUserAnswers] = useState<{
    [questionId: number]: string[]
  }>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([])
  const { isOpen: isKeyboardOpen, onToggle: onToggleKeyboard } = useDisclosure()
  const [activeBlankIndex, setActiveBlankIndex] = useState<number | null>(null)
  const [pendingSymbol, setPendingSymbol] = useState<string | null>(null)

  // Load hangman quiz data
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        console.log(
          'Loading hangman IPA quiz data for lessonId:',
          lessonId,
          'quizIndex:',
          quizIndex,
        )
        const response = await fetch('/hangmanIPAData.json')
        const data: HangmanQuizData = await response.json()
        console.log('Loaded hangman quiz data:', data)
        setQuizData(data)

        // Initialize empty answers
        const initialAnswers: { [questionId: number]: string[] } = {}
        data.questions_data.forEach((question) => {
          initialAnswers[question.id] = new Array(question.blanks).fill('')
        })
        setUserAnswers(initialAnswers)
      } catch (error) {
        console.error('Error loading hangman quiz data:', error)
      }
    }

    loadQuizData()
  }, [lessonId, quizIndex])

  // Load saved progress
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
                const savedAnswers = JSON.parse(savedAnswer.textAnswer)
                setUserAnswers(savedAnswers)
              } catch (error) {
                console.error('Error parsing saved hangman answers:', error)
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

  const checkQuestionCompletion = useCallback((question: HangmanQuestion) => {
    const userAnswer = userAnswers[question.id] || []
    return (
      userAnswer.every((answer) => answer !== '') &&
      userAnswer.length === question.blanks &&
      userAnswer.every(
        (answer, index) => answer === question.correctAnswer[index],
      )
    )
  }, [userAnswers])

  // Auto-advance to next question when current question is completed
  useEffect(() => {
    if (!quizData) return

    const currentQuestion = quizData.questions_data[currentQuestionIndex]
    if (currentQuestion && checkQuestionCompletion(currentQuestion)) {
      // Mark question as completed
      if (!completedQuestions.includes(currentQuestion.id)) {
        setCompletedQuestions((prev) => [...prev, currentQuestion.id])
      }

      // Move to next incomplete question
      const nextQuestionIndex = quizData.questions_data.findIndex(
        (question, index) =>
          index > currentQuestionIndex &&
          !completedQuestions.includes(question.id),
      )

      if (nextQuestionIndex !== -1) {
        setCurrentQuestionIndex(nextQuestionIndex)
      }
    }
  }, [userAnswers, currentQuestionIndex, quizData, completedQuestions, checkQuestionCompletion])

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol)
  }

  const handleBlankClick = (questionId: number, blankIndex: number) => {
    if (selectedSymbol) {
      // If a symbol is selected from the bank, place it
      setUserAnswers((prev) => {
        const newAnswers = { ...prev }
        if (!newAnswers[questionId]) {
          newAnswers[questionId] = []
        }
        const questionAnswers = [...newAnswers[questionId]]
        questionAnswers[blankIndex] = selectedSymbol
        newAnswers[questionId] = questionAnswers
        return newAnswers
      })
      setSelectedSymbol(null)
    } else {
      // If no symbol is selected, set this as the active blank for keyboard input
      setActiveBlankIndex(blankIndex)
    }
  }

  // Handle symbol input from IPA keyboard (for button clicks)
  const handleKeyboardSymbolClick = (symbol: string) => {
    if (!quizData || activeBlankIndex === null) return

    const currentQuestion = quizData.questions_data[currentQuestionIndex]
    if (!currentQuestion) return

    setUserAnswers((prev) => {
      const newAnswers = { ...prev }
      if (!newAnswers[currentQuestion.id]) {
        newAnswers[currentQuestion.id] = []
      }
      const questionAnswers = [...newAnswers[currentQuestion.id]]
      questionAnswers[activeBlankIndex] = symbol
      newAnswers[currentQuestion.id] = questionAnswers
      return newAnswers
    })

    setPendingSymbol(null)

    // Move to next blank or clear active blank
    if (activeBlankIndex < currentQuestion.blanks - 1) {
      setActiveBlankIndex(activeBlankIndex + 1)
    } else {
      setActiveBlankIndex(null)
    }
  }

  // Handle symbol preview from keyboard shortcuts (for T9 cycling)
  const handleKeyboardSymbolPreview = (symbol: string) => {
    setPendingSymbol(symbol)
  }

  const handleClearBlank = (questionId: number, blankIndex: number) => {
    setUserAnswers((prev) => {
      const newAnswers = { ...prev }
      if (!newAnswers[questionId]) {
        newAnswers[questionId] = []
      }
      const questionAnswers = [...newAnswers[questionId]]
      questionAnswers[blankIndex] = ''
      newAnswers[questionId] = questionAnswers
      return newAnswers
    })
  }

  const checkOverallCompletion = () => {
    if (!quizData) return false
    return quizData.questions_data.every((question) =>
      checkQuestionCompletion(question),
    )
  }

  const submitQuiz = async () => {
    if (!quizData) return
    setIsLoading(true)
    try {
      const answersToSubmit = quizData.questions.map((question) => ({
        questionId: question.id,
        textAnswer: JSON.stringify(userAnswers), // Save all answers as JSON
      }))

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
        onComplete()
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinish = () => {
    submitQuiz()
  }

  const isQuizValid = checkOverallCompletion()

  if (!quizData) {
    return <Text>Loading hangman IPA quiz...</Text>
  }

  const currentQuestion = quizData.questions_data[currentQuestionIndex]
  const remainingQuestions = quizData.questions_data.filter(
    (q) => !completedQuestions.includes(q.id),
  )
  const isCurrentQuestionComplete = currentQuestion
    ? checkQuestionCompletion(currentQuestion)
    : false

  return (
    <VStack spacing={4} align="stretch" maxW="1000px" mx="auto" p={4}>
      <Text fontSize="xl" fontWeight="bold" textAlign="center">
        {quizData.questions[0]?.text || 'IPA Transcription Quiz'}
      </Text>

      {/* Progress indicator */}
      <Box textAlign="center">
        <Text fontSize="sm" color="gray.600">
          Question {currentQuestionIndex + 1} of{' '}
          {quizData.questions_data.length}({completedQuestions.length}{' '}
          completed)
        </Text>
      </Box>

      {/* Instructions */}
      <Box
        bg="gray.50"
        p={3}
        borderRadius="lg"
        border="1px solid"
        borderColor="gray.200"
      >
        <Text fontSize="sm" color="black">
          <Text as="span" fontWeight="bold" color="green.600">
            Instructions:
          </Text>{' '}
          Point and click the correct IPA symbol into the blank spaces to
          transcribe the presented word.
        </Text>
        <Text fontSize="sm" color="purple.600" mt={1}>
          Syllabic consonant indicators, stress indicators, and syllable breaks
          have been provided for you.
        </Text>
        <Text fontSize="sm" color="red.600" mt={2}>
          <Text as="span" fontWeight="bold">
            Note:
          </Text>{' '}
          This is just hangman, minus the hanged man. A word will appear with
          the corresponding number of blank spots, must point and click from the
          same word bank each time to fill in the blank.
        </Text>
      </Box>

      {/* Symbol Bank */}
      <Box>
        <Flex justify="space-between" align="center" mb={3}>
          <Text fontWeight="bold" fontSize="lg">
            Symbol bank:
          </Text>
          <Tooltip
            label={isKeyboardOpen ? 'Hide IPA Keyboard' : 'Show IPA Keyboard'}
          >
            <IconButton
              aria-label="Toggle IPA Keyboard"
              icon={<MdKeyboard size={24} />}
              onClick={onToggleKeyboard}
              variant={isKeyboardOpen ? 'brandBold' : 'brandWhite'}
              size="sm"
            />
          </Tooltip>
        </Flex>
        <IPAKeyboard
          symbolBankCategories={quizData.symbolBankCategories}
          customSymbols={quizData.symbolBank}
          onSymbolClick={handleSymbolSelect}
          showTextArea={false}
          compact={true}
          hideInstructions={true}
          showCategoriesInCompact={!!quizData.symbolBankCategories}
        />
        {selectedSymbol && (
          <Text mt={3} fontSize="sm" fontWeight="medium" textAlign="center">
            Selected:{' '}
            <Text
              as="span"
              fontFamily="'Charis SIL', serif"
              fontWeight="bold"
              fontSize="lg"
            >
              {selectedSymbol}
            </Text>{' '}
            - Click on a blank space to place it
          </Text>
        )}
      </Box>

      {/* IPA Keyboard (Collapsible) */}
      <Collapse in={isKeyboardOpen} animateOpacity>
        <Box mb={4}>
          <IPAKeyboard
            onSymbolClick={handleKeyboardSymbolClick}
            onSymbolPreview={handleKeyboardSymbolPreview}
            showTextArea={false}
            compact={false}
            hideInstructions={true}
            title="Full IPA Keyboard"
          />
          {activeBlankIndex !== null && (
            <Box
              mt={2}
              p={2}
              bg="blue.50"
              borderRadius="md"
              border="1px solid"
              borderColor="blue.200"
            >
              <Text fontSize="sm" color="blue.800">
                <Text as="span" fontWeight="bold">
                  Active Blank:
                </Text>{' '}
                Position {activeBlankIndex + 1} - Click a symbol above or use
                Ctrl+Letter shortcuts. The symbol will cycle in the blank space
                and be committed after 1 second.
              </Text>
            </Box>
          )}
        </Box>
      </Collapse>

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
          Click on a symbol from the bank above, then click on a blank space to
          place it. You can also click the{' '}
          <Icon as={MdKeyboard} display="inline" verticalAlign="middle" />{' '}
          button to open the full IPA keyboard - then{' '}
          <Text as="span" fontWeight="bold" color="blue.600">
            click a blank space first
          </Text>{' '}
          (it will turn blue), then click symbols from the keyboard or use
          Ctrl+Letter shortcuts. Double-click on a filled space to clear it.
        </Text>
      </Box>

      {/* Current Question */}
      {currentQuestion && !isCurrentQuestionComplete && (
        <Box
          border="2px solid"
          borderColor="brand.iris"
          borderRadius="lg"
          p={6}
          bg="white"
        >
          <Text fontSize="lg" fontWeight="bold" mb={3}>
            QUESTION {currentQuestionIndex + 1}:
          </Text>

          <Text fontSize="xl" fontWeight="bold" mb={2}>
            &ldquo;{currentQuestion.word}&rdquo;
          </Text>

          {/* Blank spaces */}
          <Flex gap={2} align="center" mb={3}>
            {Array.from({ length: currentQuestion.blanks }, (_, blankIndex) => {
              const userAnswer = userAnswers[currentQuestion.id] || []
              const isCorrect =
                userAnswer[blankIndex] ===
                currentQuestion.correctAnswer[blankIndex]
              const hasAnswer = userAnswer[blankIndex] !== ''

              const isActiveBlank = activeBlankIndex === blankIndex
              const displaySymbol =
                isActiveBlank && pendingSymbol
                  ? pendingSymbol
                  : userAnswer[blankIndex]

              return (
                <Box
                  key={blankIndex}
                  minW="50px"
                  h="50px"
                  border="2px solid"
                  borderColor={
                    hasAnswer
                      ? isCorrect
                        ? 'green.500'
                        : 'red.500'
                      : isActiveBlank
                      ? 'blue.500'
                      : selectedSymbol
                      ? 'brand.iris'
                      : 'gray.300'
                  }
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  cursor="pointer"
                  bg={
                    isActiveBlank ? 'blue.50' : hasAnswer ? 'gray.50' : 'white'
                  }
                  onClick={() =>
                    handleBlankClick(currentQuestion.id, blankIndex)
                  }
                  onDoubleClick={() =>
                    handleClearBlank(currentQuestion.id, blankIndex)
                  }
                  _hover={{
                    bg: 'gray.100',
                    borderColor: 'brand.iris',
                  }}
                  transition="all 0.2s"
                  position="relative"
                >
                  {displaySymbol ? (
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      fontFamily="'Charis SIL', serif"
                      color={
                        isActiveBlank && pendingSymbol ? 'blue.600' : 'black'
                      }
                    >
                      {displaySymbol}
                    </Text>
                  ) : (
                    <Text color="gray.400" fontSize="sm">
                      _
                    </Text>
                  )}
                </Box>
              )
            })}
          </Flex>
        </Box>
      )}

      {/* Completion message */}
      {isCurrentQuestionComplete && (
        <Box
          border="2px solid"
          borderColor="green.500"
          borderRadius="lg"
          p={6}
          bg="green.50"
          textAlign="center"
        >
          <Text fontSize="lg" fontWeight="bold" color="green.800" mb={2}>
            ✓ Correct! Moving to next question...
          </Text>
          <Text fontSize="sm" color="green.700">
            Question {currentQuestionIndex + 1} completed successfully
          </Text>
        </Box>
      )}

      {/* Quiz completion */}
      {remainingQuestions.length === 0 && (
        <Box
          border="2px solid"
          borderColor="green.500"
          borderRadius="lg"
          p={6}
          bg="green.50"
          textAlign="center"
        >
          <Text fontSize="xl" fontWeight="bold" color="green.800" mb={2}>
            🎉 Congratulations!
          </Text>
          <Text fontSize="lg" color="green.700">
            You&apos;ve completed all {quizData.questions_data.length} questions!
          </Text>
        </Box>
      )}

      {isCompleted && (
        <Box
          mt={2}
          p={3}
          bg="green.100"
          borderRadius="lg"
          border="1px solid"
          borderColor="green.300"
        >
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

export default HangmanIPAExercise
