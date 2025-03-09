import React, { useState, useEffect } from 'react'
import { Box, Text, Grid, GridItem, Button, Flex } from '@chakra-ui/react'
import { MdVolumeUp } from 'react-icons/md'
import useQuiz from './utils'
import QuizNavigation from './QuizNavigation'
import { AnswerOption } from './QuizTypes'

interface SymbolExerciseProps {
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

const SymbolExercise: React.FC<SymbolExerciseProps> = ({
  lessonId,
  quizIndex,
  onComplete,
}) => {
  const { quizzes } = useQuiz(lessonId)
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [shuffledAnswerOptions, setShuffledAnswerOptions] = useState<any[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [completedWords, setCompletedWords] = useState<any[]>([])

  const quizData = quizzes[quizIndex]

  useEffect(() => {
    if (quizData?.questions) {
      // Get all answer options and flatten them with their corresponding question's correct symbol
      const allOptions = quizData.questions.flatMap((q) =>
        q.answerOptions.map((opt) => ({
          ...opt,
          correctSymbol: q.text, // The IPA symbol this option should match with
        })),
      )
      setShuffledAnswerOptions(shuffleArray(allOptions))
    }
  }, [quizData?.questions])

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

  const getSymbolBank = () => {
    if (!quizData?.questions) return []
    // Get unique IPA symbols from questions
    return Array.from(new Set(quizData.questions.map((q) => q.text)))
  }

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(selectedSymbol === symbol ? null : symbol)
  }

  const handleAnswerClick = (answerId: number, correctSymbol: string) => {
    if (selectedSymbol) {
      const isCorrect = selectedSymbol === correctSymbol
      if (isCorrect) {
        // Add current word to completed words
        setCompletedWords((prev) => [
          ...prev,
          shuffledAnswerOptions[currentWordIndex],
        ])
        // Move to next word
        setCurrentWordIndex((prev) => prev + 1)
      }
      setAnswers((prev) => ({
        ...prev,
        [answerId]: selectedSymbol,
      }))
      setSelectedSymbol(null)
    }
  }

  const underlineWord = (word: string, rhymeCategories: string | string[]) => {
    if (!rhymeCategories) {
      return (
        <Text as="span" fontFamily="'Charis SIL', serif">
          {word}
        </Text>
      )
    }

    // Parse the rhymeCategories if it's a string
    const categories =
      typeof rhymeCategories === 'string'
        ? JSON.parse(rhymeCategories)
        : rhymeCategories

    let result = word.split('')
    const underlineIndices = new Set<number>()

    categories.forEach((category: string) => {
      switch (category) {
        case 'First':
          underlineIndices.add(0)
          break
        case 'First Two':
          underlineIndices.add(0)
          underlineIndices.add(1)
          break
        case 'Last':
          underlineIndices.add(word.length - 1)
          break
        case 'Last Two':
          underlineIndices.add(word.length - 2)
          underlineIndices.add(word.length - 1)
          break
        case 'Last Three':
          underlineIndices.add(word.length - 3)
          underlineIndices.add(word.length - 2)
          underlineIndices.add(word.length - 1)
          break
        case 'Second To Last':
          underlineIndices.add(word.length - 2)
          break
      }
    })

    return (
      <Text as="span" fontFamily="'Charis SIL', serif">
        {result.map((char, index) =>
          underlineIndices.has(index) ? (
            <Text as="u" display="inline" key={index}>
              {char}
            </Text>
          ) : (
            <Text as="span" display="inline" key={index}>
              {char}
            </Text>
          ),
        )}
      </Text>
    )
  }
  const isAnswerCorrect = (answerId: number, correctSymbol: string) => {
    return answers[answerId] === correctSymbol
  }

  const getBackgroundColor = (answerId: number, correctSymbol: string) => {
    if (!answers[answerId]) return 'white'
    return isAnswerCorrect(answerId, correctSymbol) ? 'green.100' : 'red.100'
  }

  const areAllAnswered = () => {
    return currentWordIndex >= shuffledAnswerOptions.length
  }

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
          Select the IPA consonant symbol that corresponds with the underlined
          part of the word when spoken in a General American dialect.
        </Text>
      </Box>

      {/* Symbol Bank */}
      <Box mb={8}>
        <Text fontWeight="bold" mb={2}>
          Symbol Bank:
        </Text>
        <Grid
          templateColumns="repeat(7, 1fr)"
          gap={2}
          position="sticky"
          top="70px"
          backgroundColor="white"
          zIndex={1}
          py={4}
        >
          {getSymbolBank().map((symbol) => (
            <GridItem key={symbol}>
              <Button
                onClick={() => handleSymbolSelect(symbol)}
                variant={selectedSymbol === symbol ? 'solid' : 'outline'}
                colorScheme={selectedSymbol === symbol ? 'blue' : 'gray'}
                fontFamily="'Charis SIL', serif"
                width="100%"
              >
                {symbol}
              </Button>
            </GridItem>
          ))}
        </Grid>
      </Box>

      {/* Current Word */}
      <Box mb={8}>
        {currentWordIndex < shuffledAnswerOptions.length && (
          <Box
            borderWidth={1}
            borderColor="gray.200"
            borderRadius="md"
            p={4}
            backgroundColor={
              answers[shuffledAnswerOptions[currentWordIndex].id]
                ? getBackgroundColor(
                    shuffledAnswerOptions[currentWordIndex].id,
                    shuffledAnswerOptions[currentWordIndex].correctSymbol,
                  )
                : 'white'
            }
            onClick={() =>
              handleAnswerClick(
                shuffledAnswerOptions[currentWordIndex].id,
                shuffledAnswerOptions[currentWordIndex].correctSymbol,
              )
            }
            cursor="pointer"
            _hover={{ borderColor: 'gray.300' }}
          >
            <Flex alignItems="center" justify="space-between">
              <Flex alignItems="center" gap={2}>
                <Box>
                  {underlineWord(
                    shuffledAnswerOptions[currentWordIndex].optionText,
                    shuffledAnswerOptions[currentWordIndex].rhymeCategory,
                  )}
                </Box>
                {shuffledAnswerOptions[currentWordIndex].audioUrl && (
                  <AudioButton
                    audioUrl={shuffledAnswerOptions[currentWordIndex].audioUrl}
                  />
                )}
              </Flex>
              {answers[shuffledAnswerOptions[currentWordIndex].id] && (
                <Text
                  fontFamily="'Charis SIL', serif"
                  fontWeight="bold"
                  fontSize="lg"
                >
                  {answers[shuffledAnswerOptions[currentWordIndex].id]}
                </Text>
              )}
            </Flex>
          </Box>
        )}
      </Box>

      {/* Completed Words */}
      <Box mb={8}>
        <Text fontWeight="bold" mb={2}>
          Completed Words:
        </Text>
        <Flex flexWrap="wrap" gap={2}>
          {completedWords.map((word, index) => (
            <Box
              key={index}
              borderWidth={1}
              borderColor="gray.200"
              borderRadius="md"
              p={2}
              backgroundColor="green.100"
            >
              <Flex alignItems="center" gap={2}>
                <Text>{word.optionText}</Text>
                <Text fontFamily="'Charis SIL', serif">
                  ({word.correctSymbol})
                </Text>
              </Flex>
            </Box>
          ))}
        </Flex>
      </Box>

      <QuizNavigation
        currentQuestion={1}
        totalQuestions={1}
        onPrevious={() => {}}
        onNext={onComplete}
        onFinish={onComplete}
        isNextDisabled={!areAllAnswered()}
      />
    </Box>
  )
}

export default SymbolExercise
