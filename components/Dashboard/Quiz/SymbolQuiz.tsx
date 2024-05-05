import React, { useState, useEffect } from 'react'
import { Box, Text, Grid, GridItem, Button, Flex } from '@chakra-ui/react'

interface QuizItem {
  symbol: string
  words: string[]
}

interface SymbolQuizProps {
  lessonTitle: string
}

const SymbolQuiz: React.FC<SymbolQuizProps> = ({ lessonTitle }) => {
  const [quizItems, setQuizItems] = useState<QuizItem[]>([])
  const [selectedSymbols, setSelectedSymbols] = useState<
    Record<string, string>
  >({})
  const [selectedWord, setSelectedWord] = useState<string | null>(null)

  const isVowelLesson = lessonTitle.includes('Vowels')
  useEffect(() => {
    const vowelWords = [
      { symbol: 'i', words: ['feed', 'chief', 'nifty', 'machine'] },
      { symbol: 'ɪ', words: ['chill', 'think', 'mischief'] },
      { symbol: 'ɛ', words: ['scent', 'sweat', 'measure'] },
      { symbol: 'æ', words: ['black', 'champion', 'asterisk'] },
      { symbol: 'ɑ', words: ['blot', 'option', 'auto'] },
      { symbol: 'ʌ', words: ['bunny', 'loving', 'trunk'] },
      { symbol: 'ʊ', words: ['put', 'should', 'wood'] },
      { symbol: 'u', words: ['blue', 'screw', 'move'] },
      { symbol: 'ə', words: ['amaze', 'llama', 'unnecessary'] },
      { symbol: 'ɚ', words: ['caller', 'perceive', 'earner'] },
      { symbol: 'ɝ', words: ['purse', 'surf', 'learn'] },
    ]

    const consonantWords = [
      { symbol: 'p', words: ['pretty', 'stop'] },
      { symbol: 'b', words: ['babe', 'club'] },
      { symbol: 'm', words: ['mist', 'comb'] },
      { symbol: 'f', words: ['offer', 'sift'] },
      { symbol: 'v', words: ['oven', 'vain'] },
      { symbol: 't', words: ['tire', 'bait'] },
      { symbol: 'd', words: ['dead', 'adorn'] },
      { symbol: 'n', words: ['noon', 'win'] },
      { symbol: 'ɾ', words: ['patting', 'hearty'] },
      { symbol: 'θ', words: ['fourth', 'think'] },
      { symbol: 'ð', words: ['breathe', 'bother'] },
      { symbol: 's', words: ['suspect', 'cent'] },
      { symbol: 'z', words: ['scissors', 'cheese'] },
      { symbol: 'ʃ', words: ['shush', 'ocean'] },
      { symbol: 'ʒ', words: ['garage', 'measure'] },
      { symbol: 'ɹ', words: ['bring', 'arrange'] },
      { symbol: 'l', words: ['lily', 'mellow'] },
      { symbol: 'j', words: ['yelp', 'uniform'] },
      { symbol: 'k', words: ['crack', 'scheme'] },
      { symbol: 'g', words: ['gurgle', 'green'] },
      { symbol: 'ŋ', words: ['tongue', 'think'] },
      { symbol: 'ʔ', words: ['curtain', 'uh-oh'] },
      { symbol: 'h', words: ['hoist', 'behemoth'] },
      { symbol: 'ç', words: ['inhumane', 'hubris'] },
      { symbol: 'w', words: ['one', 'inward'] },
      { symbol: 't͡ʃ', words: ['church', 'itchy'] },
      { symbol: 'd͡ʒ', words: ['judge', 'gerbil'] },
      { symbol: 'ɫ', words: ['pull', 'tilt'] },
    ]

    const words = isVowelLesson ? vowelWords : consonantWords
    const shuffledWords = words.sort(() => Math.random() - 0.5)
    setQuizItems(shuffledWords)
  }, [lessonTitle])

  const handleSymbolSelect = (symbol: string) => {
    if (selectedWord) {
      setSelectedSymbols((prevSymbols) => ({
        ...prevSymbols,
        [selectedWord]: symbol,
      }))
      setSelectedWord(null)
    }
  }

  const handleWordClick = (word: string) => {
    setSelectedWord(word)
  }

  const isWordCorrect = (word: string) => {
    const quizItem = quizItems.find((item) => item.words.includes(word))
    return quizItem && selectedSymbols[word] === quizItem.symbol
  }

  const underlineWord = (word: string) => {
    const underlinedWord = word.split('').map((char, index) => {
      if (char === char.toLowerCase()) {
        return (
          <Text as="u" key={index}>
            {char}
          </Text>
        )
      }
      return <Text key={index}>{char}</Text>
    })
    return <Text as="span">{underlinedWord}</Text>
  }

  const symbols = !isVowelLesson
    ? ['i', 'ɪ', 'ɛ', 'æ', 'ɑ', 'ʌ', 'ʊ', 'u', 'ə', 'ɚ', 'ɝ']
    : [
        'p',
        'b',
        'm',
        'f',
        'v',
        't',
        'd',
        'n',
        'ɾ',
        'θ',
        'ð',
        's',
        'z',
        'ʃ',
        'ʒ',
        'ɹ',
        'l',
        'j',
        'k',
        'g',
        'ŋ',
        'ʔ',
        'h',
        'ç',
        'w',
        't͡ʃ',
        'd͡ʒ',
        'ɫ',
      ]

  console.log(symbols)

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
        {symbols.map((symbol) => (
          <GridItem key={symbol}>
            <Button onClick={() => handleSymbolSelect(symbol)}>{symbol}</Button>
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
                      isWordCorrect(word) ? 'green.100' : 'red.100'
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

export default SymbolQuiz
