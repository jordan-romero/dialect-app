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
  const [selectedSymbols, setSelectedSymbols] = useState<
    Record<number, string>
  >({})
  const [selectedWord, setSelectedWord] = useState<number | null>(null)
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([])

  const quizData = quizzes[quizIndex]

  useEffect(() => {
    if (quizData?.questions) {
      setShuffledQuestions(shuffleArray(quizData.questions))
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

  const handleSymbolSelect = (symbol: string) => {
    if (selectedWord !== null) {
      setSelectedSymbols((prevSymbols) => ({
        ...prevSymbols,
        [selectedWord]: symbol,
      }))
      setSelectedWord(null)
    }
  }

  const handleWordClick = (questionId: number) => {
    setSelectedWord(questionId)
  }

  const getUniqueSymbols = () => {
    if (!quizData?.questions) return []
    const symbols = quizData.questions.flatMap((q) =>
      q.answerOptions.map((option) => option.optionText),
    )
    return Array.from(new Set(symbols))
  }

  const underlineWord = (word: string, rhymeCategory?: string) => {
    if (!rhymeCategory) return word

    switch (rhymeCategory) {
      case 'Last Two':
        return (
          <Text as="span" fontFamily="'Charis SIL', serif">
            {word.slice(0, -2)}
            <Text as="u">{word.slice(-2)}</Text>
          </Text>
        )
      case 'Last Three':
        return (
          <Text as="span" fontFamily="'Charis SIL', serif">
            {word.slice(0, -3)}
            <Text as="u">{word.slice(-3)}</Text>
          </Text>
        )
      case 'First':
        return (
          <Text as="span" fontFamily="'Charis SIL', serif">
            <Text as="u">{word.slice(0, 1)}</Text>
            {word.slice(1)}
          </Text>
        )
      case 'First Two':
        return (
          <Text as="span" fontFamily="'Charis SIL', serif">
            <Text as="u">{word.slice(0, 2)}</Text>
            {word.slice(2)}
          </Text>
        )
      default:
        return word
    }
  }

  const areAllWordsAnswered = () => {
    return shuffledQuestions.every((q) => selectedSymbols[q.id])
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

      <Grid
        templateColumns="repeat(4, 1fr)"
        gap={4}
        mb={8}
        position="sticky"
        top="70px"
        backgroundColor="white"
        zIndex={1}
        py={4}
      >
        {getUniqueSymbols().map((symbol) => (
          <GridItem key={symbol}>
            <Button
              onClick={() => handleSymbolSelect(symbol)}
              variant="outline"
              colorScheme={selectedWord !== null ? 'blue' : 'gray'}
              fontFamily="'Charis SIL', serif"
              width="100%"
            >
              {symbol}
            </Button>
          </GridItem>
        ))}
      </Grid>

      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        {shuffledQuestions.map((question) => {
          const rhymeCategory = question.answerOptions[0]?.rhymeCategory

          return (
            <GridItem key={question.id}>
              <Box
                onClick={() => handleWordClick(question.id)}
                cursor="pointer"
                borderWidth={1}
                borderColor={
                  selectedWord === question.id ? 'blue.500' : 'gray.200'
                }
                borderRadius="md"
                p={4}
                backgroundColor={
                  selectedWord === question.id ? 'blue.50' : 'white'
                }
              >
                <Flex alignItems="center" justifyContent="space-between" mb={2}>
                  <Text fontWeight="bold" fontSize="xl">
                    {underlineWord(question.text, rhymeCategory)}
                  </Text>
                  {question.audioUrl && (
                    <AudioButton audioUrl={question.audioUrl} />
                  )}
                </Flex>
                <Flex justifyContent="center" mt={2}>
                  <Box
                    borderWidth={1}
                    borderColor="gray.200"
                    borderRadius="md"
                    p={2}
                    minWidth="60px"
                    textAlign="center"
                    backgroundColor="gray.100"
                  >
                    <Text fontFamily="'Charis SIL', serif">
                      {selectedSymbols[question.id] || '?'}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            </GridItem>
          )
        })}
      </Grid>

      <QuizNavigation
        currentQuestion={1}
        totalQuestions={1}
        onPrevious={() => {}}
        onNext={onComplete}
        onFinish={onComplete}
        isNextDisabled={!areAllWordsAnswered()}
      />
    </Box>
  )
}

export default SymbolExercise
