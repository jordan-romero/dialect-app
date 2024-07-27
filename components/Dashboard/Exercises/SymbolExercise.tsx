import React, { useState, useEffect } from 'react'
import { Box, Text, Grid, GridItem, Button, Flex } from '@chakra-ui/react'
import { getQuizItems } from './symbols.utils'

interface QuizItem {
  symbol: string
  words: string[]
}

interface SymbolExerciseProps {
  lessonTitle: string
  quizIndex: number // Add quizIndex to specify which quiz to render
}

const SymbolExercise: React.FC<SymbolExerciseProps> = ({
  lessonTitle,
  quizIndex,
}) => {
  const [quizItems, setQuizItems] = useState<QuizItem[]>([])
  const [selectedSymbols, setSelectedSymbols] = useState<
    Record<string, string>
  >({})
  const [selectedWord, setSelectedWord] = useState<string | null>(null)

  useEffect(() => {
    const items = getQuizItems(lessonTitle)
    const shuffledItems = items.sort(() => Math.random() - 0.5)
    setQuizItems(shuffledItems)
  }, [lessonTitle, quizIndex])

  const handleSymbolSelect = (symbol: string) => {
    if (selectedWord) {
      setSelectedSymbols((prevSymbols) => ({
        ...prevSymbols,
        [selectedWord]: symbol,
      }))
      setSelectedWord(null) // Clear the selected word after assigning a symbol
    }
  }

  const handleWordClick = (word: string) => {
    setSelectedWord(word)
  }

  const isWordCorrect = (word: string) => {
    const quizItem = quizItems.find((item) => item.words.includes(word))
    return quizItem && selectedSymbols[word] === quizItem.symbol
  }

  const underlineWord = (word: string) => (
    <Text as="span">
      {word.split('').map((char, index) => (
        <Text as="u" key={index}>
          {char}
        </Text>
      ))}
    </Text>
  )

  return (
    <Box maxHeight="80vh" overflowY="scroll">
      <Text fontStyle="italic" mb={4}>
        Instructions: Click on a word to select it, then choose the IPA
        consonant symbol that corresponds with the underlined part of the word.
      </Text>
      <Grid
        templateColumns="repeat(4, 1fr)"
        gap={4}
        mb={8}
        position="sticky"
        top={0}
        backgroundColor="white"
        zIndex={1}
        py={4}
      >
        {quizItems.length > 0 &&
          quizItems.map((item) => (
            <GridItem key={item.symbol}>
              <Button
                onClick={() => handleSymbolSelect(item.symbol)}
                variant="outline"
                colorScheme={selectedWord ? 'blue' : 'gray'}
              >
                {item.symbol}
              </Button>
            </GridItem>
          ))}
      </Grid>
      <Grid templateColumns="repeat(3, 1fr)" gap={4}>
        {quizItems.map((quizItem) =>
          quizItem.words.map((word) => (
            <GridItem key={word}>
              <Box
                onClick={() => handleWordClick(word)}
                cursor="pointer"
                borderWidth={1}
                borderColor={selectedWord === word ? 'blue.500' : 'gray.200'}
                borderRadius="md"
                p={2}
                backgroundColor={selectedWord === word ? 'blue.50' : 'white'}
              >
                {underlineWord(word)}
                <Flex justifyContent="center" mt={2}>
                  <Box
                    borderWidth={1}
                    borderColor="gray.200"
                    borderRadius="md"
                    p={1}
                    minWidth="40px"
                    textAlign="center"
                    backgroundColor={
                      selectedSymbols[word]
                        ? isWordCorrect(word)
                          ? 'green.100'
                          : 'red.100'
                        : 'gray.100'
                    }
                  >
                    {selectedSymbols[word] || '?'}
                  </Box>
                </Flex>
              </Box>
            </GridItem>
          )),
        )}
      </Grid>
    </Box>
  )
}

export default SymbolExercise
