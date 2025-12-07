import React, { useState, useEffect, Fragment } from 'react'
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
  Flex,
  Badge,
  Tooltip,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import QuizNavigation from './QuizNavigation'
import { IPAKeyboard } from '../../Community/IPAKeyboard'

interface LexicalItem {
  id: string
  exampleWord: string
  ipaSymbol: string
  wordBank: string[]
  category: 'monophthongs' | 'diphthongs' | 'triphthongs'
}

interface LexicalChartData {
  id: number
  lessonId: number
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
  lexicalItems: LexicalItem[]
  availableSymbols: string[]
}

interface LexicalChartExerciseProps {
  lessonId: number
  quizIndex: number
  onComplete: () => void
}

export const LexicalChartExercise: React.FC<LexicalChartExerciseProps> = ({
  lessonId,
  quizIndex,
  onComplete,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [chartData, setChartData] = useState<LexicalChartData | null>(null)
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<
    'monophthongs' | 'diphthongs' | 'triphthongs'
  >('monophthongs')

  // Load lexical chart data
  useEffect(() => {
    const loadChartData = async () => {
      try {
        console.log(
          'Loading lexical chart data for lessonId:',
          lessonId,
          'quizIndex:',
          quizIndex,
        )
        const response = await fetch('/lexicalChartData.json')
        const data: LexicalChartData = await response.json()
        console.log('Loaded lexical chart data:', data)
        setChartData(data)

        // Initialize empty answers
        const initialAnswers: { [key: string]: string } = {}
        data.lexicalItems.forEach((item) => {
          initialAnswers[item.id] = ''
        })
        setUserAnswers(initialAnswers)
      } catch (error) {
        console.error('Error loading lexical chart data:', error)
      }
    }

    loadChartData()
  }, [lessonId, quizIndex])

  // Load saved progress
  useEffect(() => {
    const loadProgress = async () => {
      if (!chartData) return

      try {
        const response = await fetch(
          `/api/userQuizProgress?quizId=${chartData.id}&lessonId=${lessonId}`,
        )
        if (response.ok) {
          const data = await response.json()
          setIsCompleted(data.isCompleted)

          // Restore saved answers
          if (data.answers && data.answers.length > 0) {
            const savedAnswer = data.answers.find(
              (answer: any) => answer.questionId === chartData.questions[0]?.id,
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
                console.error('Error parsing saved answers:', error)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading quiz progress:', error)
      }
    }

    loadProgress()
  }, [chartData, lessonId])

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol)
  }

  const handlePositionClick = (itemId: string) => {
    if (selectedSymbol) {
      setUserAnswers((prev) => ({
        ...prev,
        [itemId]: selectedSymbol,
      }))
      setSelectedSymbol(null) // Reset selection after placing
    }
  }

  const handleClearPosition = (itemId: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [itemId]: '',
    }))
  }

  const checkCategoryCompletion = (category: string) => {
    if (!chartData) return false

    const categoryItems = chartData.lexicalItems.filter(
      (item) => item.category === category,
    )
    return categoryItems.every(
      (item) => userAnswers[item.id] === item.ipaSymbol,
    )
  }

  const checkOverallCompletion = () => {
    if (!chartData) return false
    return chartData.lexicalItems.every(
      (item) => userAnswers[item.id] === item.ipaSymbol,
    )
  }

  const handleFinish = async () => {
    await submitQuiz()
    onComplete()
  }

  const submitQuiz = async () => {
    if (!chartData) return

    setIsLoading(true)
    try {
      const answersToSubmit = chartData.questions.map((question) => ({
        questionId: question.id,
        textAnswer: JSON.stringify(userAnswers),
      }))

      console.log('Submitting lexical chart quiz:', {
        quizId: chartData.id,
        lessonId: lessonId,
        answers: answersToSubmit,
        userAnswers,
      })

      const response = await fetch('/api/submitQuiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: chartData.id,
          lessonId: lessonId,
          answers: answersToSubmit,
        }),
      })

      if (response.ok) {
        setIsCompleted(true)
        console.log('Lexical chart quiz submitted successfully')
      } else {
        console.error('Failed to submit quiz')
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryItems = () => {
    if (!chartData) return []
    return chartData.lexicalItems.filter(
      (item) => item.category === currentCategory,
    )
  }

  const getAvailableSymbols = () => {
    if (!chartData) return []
    return chartData.availableSymbols
  }

  const isQuizValid = checkOverallCompletion()

  if (!chartData) {
    return <Text>Loading lexical chart quiz...</Text>
  }

  return (
    <VStack spacing={4} align="stretch" maxW="1000px" mx="auto" p={4}>
      <Text fontSize="xl" fontWeight="bold" textAlign="center">
        {chartData.questions[0]?.text ||
          'Instructions: Click on IPA symbols from the bank below and place them in their correct corresponding spots for a General American dialect.'}
      </Text>

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
          Click on a symbol from the bank below, then click on the IPA Symbol
          position next to the corresponding example word. Hover over example
          words to see additional words with the same sound. Double-click on a
          placed symbol to remove it.
        </Text>
      </Box>

      {/* Symbol Bank */}
      <IPAKeyboard
        customSymbols={getAvailableSymbols()}
        onSymbolClick={handleSymbolSelect}
        showTextArea={false}
        compact={true}
        hideInstructions={true}
        title="Symbol Bank"
      />
      {selectedSymbol && (
        <Text fontSize="sm" fontWeight="medium" textAlign="center">
          Selected:{' '}
          <Text
            as="span"
            fontFamily="'Charis SIL', serif"
            fontWeight="bold"
            fontSize="lg"
          >
            {selectedSymbol}
          </Text>{' '}
          - Click on a position to place it
        </Text>
      )}

      {/* Lexical Chart with Tabs */}
      <Box
        border="2px solid"
        borderColor="brand.iris"
        borderRadius="lg"
        p={4}
        bg="white"
        boxShadow="sm"
      >
        <Tabs
          index={
            currentCategory === 'monophthongs'
              ? 0
              : currentCategory === 'diphthongs'
              ? 1
              : 2
          }
          onChange={(index) => {
            const categories = [
              'monophthongs',
              'diphthongs',
              'triphthongs',
            ] as const
            setCurrentCategory(categories[index])
          }}
        >
          <TabList>
            <Tab>
              Monophthongs
              {checkCategoryCompletion('monophthongs') && (
                <Badge ml={2} colorScheme="green" borderRadius="full">
                  ✓
                </Badge>
              )}
            </Tab>
            <Tab>
              Diphthongs
              {checkCategoryCompletion('diphthongs') && (
                <Badge ml={2} colorScheme="green" borderRadius="full">
                  ✓
                </Badge>
              )}
            </Tab>
            <Tab>
              Triphthongs
              {checkCategoryCompletion('triphthongs') && (
                <Badge ml={2} colorScheme="green" borderRadius="full">
                  ✓
                </Badge>
              )}
            </Tab>
          </TabList>

          <TabPanels>
            {(['monophthongs', 'diphthongs', 'triphthongs'] as const).map(
              (category) => (
                <TabPanel
                  key={category}
                  p={4}
                  minH="400px"
                  maxH="500px"
                  overflowY="auto"
                >
                  <Grid templateColumns="1fr 1fr" gap={3}>
                    <GridItem>
                      <Text fontWeight="bold" mb={2}>
                        Example Word
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold" mb={2}>
                        IPA Symbol
                      </Text>
                    </GridItem>

                    {getCategoryItems().map((item) => {
                      const userAnswer = userAnswers[item.id]
                      const isCorrect = userAnswer === item.ipaSymbol
                      const hasAnswer = userAnswer !== ''

                      return (
                        <Fragment key={item.id}>
                          <GridItem>
                            <Tooltip
                              label={item.wordBank.join(', ')}
                              placement="top"
                              hasArrow
                              bg="brand.purple"
                              color="white"
                              fontSize="sm"
                              maxW="300px"
                              borderRadius="md"
                            >
                              <Text
                                fontWeight="bold"
                                textDecoration="underline"
                                cursor="help"
                                _hover={{ color: 'brand.iris' }}
                                fontSize="md"
                              >
                                {item.exampleWord}
                              </Text>
                            </Tooltip>
                          </GridItem>
                          <GridItem>
                            <Box
                              minH="35px"
                              border="2px solid"
                              borderColor={
                                isCorrect
                                  ? 'green.500'
                                  : hasAnswer
                                  ? 'red.500'
                                  : selectedSymbol
                                  ? 'brand.iris'
                                  : 'brand.blue'
                              }
                              borderRadius="md"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              cursor="pointer"
                              bg={hasAnswer ? 'gray.50' : 'white'}
                              onClick={() => handlePositionClick(item.id)}
                              onDoubleClick={() => handleClearPosition(item.id)}
                              _hover={{
                                bg: 'gray.100',
                                borderColor: 'brand.iris',
                              }}
                              transition="all 0.2s"
                            >
                              {hasAnswer ? (
                                <Text
                                  fontSize="lg"
                                  fontWeight="bold"
                                  fontFamily="'Charis SIL', serif"
                                >
                                  {userAnswer}
                                </Text>
                              ) : (
                                <Text color="gray.400" fontSize="xs">
                                  Click to place
                                </Text>
                              )}
                            </Box>
                          </GridItem>
                        </Fragment>
                      )
                    })}
                  </Grid>
                </TabPanel>
              ),
            )}
          </TabPanels>
        </Tabs>
      </Box>

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

// Keep the old component for backward compatibility
export const LexicalChart: React.FC = () => {
  return (
    <LexicalChartExercise lessonId={1} quizIndex={0} onComplete={() => {}} />
  )
}
