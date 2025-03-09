import React, { useState } from 'react'
import { Box, Button, Grid, GridItem, VStack, Tooltip } from '@chakra-ui/react'

const lexicalItems = [
  { symbol: 'ɪ', word: 'KIT', examples: ['kit', 'bit', 'sit'] },
  { symbol: 'i', word: 'FLEECE', examples: ['bee', 'agree', 'leaf'] },
  { symbol: 'ĭ', word: 'HAPPY', examples: ['anything', 'Melanie', 'every'] },
  { symbol: 'ɛ', word: 'DRESS', examples: ['bed', 'bent', 'avenge'] },
  { symbol: 'æ', word: 'TRAP', examples: ['bath', 'mass', 'scramble'] },
  { symbol: 'ɑ', word: 'LOT', examples: ['cloth', 'palm', 'shop'] },
  { symbol: 'ʊ', word: 'FOOT', examples: ['put', 'could', 'wood'] },
  { symbol: 'u', word: 'GOOSE', examples: ['blue', 'shoe', 'grew'] },
  { symbol: 'ə', word: 'COMMA', examples: ['upon', 'arena', 'congrats'] },
  { symbol: 'ʌ', word: 'STRUT', examples: ['stung', 'above', 'wonder'] },
  { symbol: 'ɚ', word: 'LETTER', examples: ['surfer', 'percussion', 'water'] },
  { symbol: 'ɝ', word: 'NURSE', examples: ['emerge', 'nerve', 'inertia'] },
]

export const LexicalChart: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [categorySelections, setCategorySelections] = useState<{
    [key: string]: string
  }>({})

  const handleSymbolClick = (symbol: string) => {
    setSelectedSymbol(symbol)
  }

  const handleCategoryClick = (category: string) => {
    if (selectedSymbol) {
      setCategorySelections((prev) => ({
        ...prev,
        [category]: selectedSymbol,
      }))
      setSelectedSymbol(null) // Reset selection after assigning
    }
  }

  return (
    <VStack spacing={4} align="center">
      {/* Word Bank Section */}
      <Box mb={6}>
        <VStack spacing={2}>
          {lexicalItems.map((item, index) => (
            <Button
              key={index}
              onClick={() => handleSymbolClick(item.symbol)}
              variant="outline"
              colorScheme={selectedSymbol === item.symbol ? 'teal' : 'gray'}
            >
              {item.symbol}
            </Button>
          ))}
        </VStack>
      </Box>

      {/* Categories Section */}
      <Grid
        templateColumns="repeat(4, 1fr)"
        gap={4}
        border="1px solid"
        borderColor="gray.300"
        p={4}
      >
        {lexicalItems.map((item, index) => (
          <GridItem key={index} colSpan={1} textAlign="center">
            <Button
              onClick={() => handleCategoryClick(item.word)}
              variant="outline"
              colorScheme={
                categorySelections[item.word] === item.symbol ? 'teal' : 'gray'
              }
              width="100%"
            >
              {categorySelections[item.word]
                ? categorySelections[item.word]
                : item.word}
            </Button>
            <Tooltip label={item.examples.join(', ')} aria-label="Examples">
              <Box>{item.word}</Box>
            </Tooltip>
          </GridItem>
        ))}
      </Grid>
    </VStack>
  )
}
