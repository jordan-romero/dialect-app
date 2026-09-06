import React, { useState, useEffect, useMemo, Fragment } from 'react'
import { renderUnderlined } from './UnderlineMarkup'
import { useShuffledBank } from './shuffle'
import {
  Box,
  Text,
  VStack,
  Grid,
  GridItem,
  Flex,
  Badge,
  Tooltip,
} from '@chakra-ui/react'
import QuizNavigation from './QuizNavigation'
import QuizSkeleton from './QuizSkeleton'
import { IPAKeyboard } from '../../Community/IPAKeyboard'

interface LexicalItem {
  id: string
  exampleWord: string
  ipaSymbol: string
  wordBank: string[]
  category: 'monophthongs' | 'diphthongs' | 'triphthongs' | 'consonants'
  /** Which column of the printed chart this row sits in (1-4). */
  column: number
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

/** Chart sections, in the order the printed chart lists them. */
const CATEGORIES = [
  'monophthongs',
  'diphthongs',
  'triphthongs',
  'consonants',
] as const
type Category = (typeof CATEGORIES)[number]

const CATEGORY_LABELS: Record<Category, string> = {
  monophthongs: 'Monophthongs',
  diphthongs: 'Diphthongs',
  triphthongs: 'Triphthongs',
  consonants: 'Consonants',
}

/** Block fills taken from the printed General American chart. */
const CATEGORY_FILLS: Record<Category, string> = {
  monophthongs: '#E6B8AF',
  diphthongs: '#FCE5CD',
  triphthongs: '#D9EAD3',
  consonants: '#CFE2F3',
}

/** The chart's rules: a heavy navy frame with hairline dividers inside. */
const CHART_BORDER = '#1F3864'

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
    // Once completed, answers are locked until "Try again".
    if (isCompleted) return
    if (selectedSymbol) {
      setUserAnswers((prev) => ({
        ...prev,
        [itemId]: selectedSymbol,
      }))
      setSelectedSymbol(null) // Reset selection after placing
    }
  }

  const handleClearPosition = (itemId: string) => {
    if (isCompleted) return
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

  // The printed chart is four columns — monophthongs, diphthongs over
  // triphthongs, then consonants across two — so mirror that instead of
  // hiding sections behind tabs. Rows carry their column; consecutive rows
  // sharing a category become one headed section.
  const itemsByCategory = useMemo(() => {
    const grouped: Record<Category, LexicalItem[]> = {
      monophthongs: [],
      diphthongs: [],
      triphthongs: [],
      consonants: [],
    }
    for (const item of chartData?.lexicalItems ?? [])
      grouped[item.category].push(item)
    return grouped
  }, [chartData])

  // Consonants run as two word/symbol pairs under one label on the chart, so
  // keep the authored column split rather than reflowing them.
  const consonantColumns = useMemo(() => {
    const byColumn = new Map<number, LexicalItem[]>()
    for (const item of itemsByCategory.consonants) {
      const bucket = byColumn.get(item.column)
      if (bucket) bucket.push(item)
      else byColumn.set(item.column, [item])
    }
    return Array.from(byColumn.entries())
      .sort(([a], [b]) => a - b)
      .map(([, items]) => items)
  }, [itemsByCategory])

  // Every section is on screen at once now, so the bank holds the whole
  // symbol set. Authored in chart order, which gives the answers away.
  const shuffledSymbols = useShuffledBank(chartData?.availableSymbols)
  const getAvailableSymbols = () => shuffledSymbols

  const isQuizValid = checkOverallCompletion()

  /**
   * One coloured block of the chart: the rotated category label down the left
   * edge, then one or more word/symbol grids beside it (consonants use two).
   */
  const renderBlock = (category: Category, rowColumns: LexicalItem[][]) => {
    const fill = CATEGORY_FILLS[category]
    return (
      <Flex bg={fill} align="stretch">
        <Flex
          align="center"
          justify="center"
          px={1}
          borderRight="1px solid white"
        >
          <Text
            fontSize="xs"
            fontWeight="bold"
            letterSpacing="2px"
            sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            {CATEGORY_LABELS[category]}
          </Text>
          {checkCategoryCompletion(category) && (
            <Badge colorScheme="green" borderRadius="full" ml={1}>
              ✓
            </Badge>
          )}
        </Flex>

        {rowColumns.map((items, columnIndex) => (
          <Grid
            key={columnIndex}
            templateColumns="minmax(96px, max-content) 46px"
            borderRight={
              columnIndex < rowColumns.length - 1
                ? '1px solid white'
                : undefined
            }
          >
            {items.map((item) => {
              const userAnswer = userAnswers[item.id]
              const isCorrect = userAnswer === item.ipaSymbol
              const hasAnswer = !!userAnswer

              return (
                <Fragment key={item.id}>
                  <GridItem
                    px={2}
                    py={1}
                    borderBottom="1px solid white"
                    borderRight="1px solid white"
                  >
                    <Tooltip
                      label={item.wordBank.join(', ')}
                      isDisabled={item.wordBank.length === 0}
                      placement="top"
                      hasArrow
                      bg="brand.purple"
                      color="white"
                      fontSize="sm"
                      maxW="300px"
                      borderRadius="md"
                    >
                      {/* Only the nucleus is underlined (the {...} span in the
                          data), the same as the printed chart. */}
                      <Text
                        fontSize="sm"
                        whiteSpace="nowrap"
                        cursor={item.wordBank.length ? 'help' : 'default'}
                      >
                        {renderUnderlined(item.exampleWord)}
                      </Text>
                    </Tooltip>
                  </GridItem>
                  <GridItem
                    borderBottom="1px solid white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    bg={
                      isCorrect ? 'green.100' : hasAnswer ? 'red.100' : 'white'
                    }
                    border="2px solid"
                    borderColor="black"
                    onClick={() => handlePositionClick(item.id)}
                    onDoubleClick={() => handleClearPosition(item.id)}
                    _hover={{ bg: 'whiteAlpha.800' }}
                    transition="background 0.15s"
                  >
                    <Text fontSize="md" fontFamily="ipa">
                      {userAnswer}
                    </Text>
                  </GridItem>
                </Fragment>
              )
            })}
          </Grid>
        ))}
      </Flex>
    )
  }

  if (!chartData) {
    return <QuizSkeleton />
  }

  return (
    <VStack spacing={4} align="stretch" w="full" mx="auto" p={4}>
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
        persistClickedSymbols={false}
        title="Symbol Bank"
        symbolSize="lg"
      />
      {/* The chart, matching the printed General American sheet: coloured
          blocks with a rotated section label down the left edge, each block a
          word/symbol grid inside a navy frame. Consonants carry two pairs. */}
      <Box
        border="3px solid"
        borderColor={CHART_BORDER}
        borderRadius="sm"
        bg="white"
        overflowX="auto"
      >
        <Text
          fontSize="xl"
          fontWeight="bold"
          fontStyle="italic"
          textAlign="center"
          py={2}
          borderBottom="3px solid"
          borderColor={CHART_BORDER}
        >
          General American English
        </Text>
        <Flex align="flex-start" wrap="wrap">
          {renderBlock('monophthongs', [itemsByCategory.monophthongs])}
          <Box>
            {renderBlock('diphthongs', [itemsByCategory.diphthongs])}
            {renderBlock('triphthongs', [itemsByCategory.triphthongs])}
          </Box>
          {renderBlock('consonants', consonantColumns)}
        </Flex>
      </Box>

      <QuizNavigation
        currentQuestion={1}
        totalQuestions={1}
        onPrevious={() => {}}
        onNext={() => {}}
        onFinish={handleFinish}
        isNextDisabled={!isQuizValid || isLoading}
        isCompleted={isCompleted}
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
