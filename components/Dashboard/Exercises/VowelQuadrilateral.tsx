import React, { useState } from 'react'
import { Box, Button, Flex, Image, VStack } from '@chakra-ui/react'
import vowelChartImage from '@/public/ipaVowelChart.png'

const vowels = [
  'i',
  'y',
  'I',
  'Y',
  'e',
  'ø',
  'ɛ',
  'œ',
  'æ',
  'a',
  'o',
  'ɔ',
  'u',
  'ʌ',
  'ɯ',
  'ɘ',
  // Add other vowels as needed
]

interface VowelPosition {
  top: number
  left: number
  vowel: string | null
}

export const VowelQuadrilateral: React.FC = () => {
  const [selectedVowel, setSelectedVowel] = useState<string | null>(null)
  const [vowelPositions, setVowelPositions] = useState<{
    [key: string]: VowelPosition
  }>({
    closeFront1: { top: 10, left: 15, vowel: null },
    closeFront2: { top: 10, left: 25, vowel: null },
    closeCentral1: { top: 10, left: 50, vowel: null },
    closeBack1: { top: 10, left: 85, vowel: null },
    midFront1: { top: 30, left: 20, vowel: null },
    midCentral1: { top: 30, left: 50, vowel: null },
    midBack1: { top: 30, left: 80, vowel: null },
    openFront1: { top: 75, left: 20, vowel: null },
    openCentral1: { top: 75, left: 50, vowel: null },
    openBack1: { top: 75, left: 80, vowel: null },
    // Add more positions as needed
  })

  const handleVowelClick = (position: string) => {
    if (selectedVowel && !vowelPositions[position].vowel) {
      setVowelPositions((prev) => ({
        ...prev,
        [position]: { ...prev[position], vowel: selectedVowel },
      }))
      setSelectedVowel(null) // Reset selection after placing
    }
  }

  const handleVowelSelect = (vowel: string) => {
    setSelectedVowel(vowel)
  }

  const vowelChart = './ipaVowelChart.png'
  const test = './casetMcSherry.jpg'

  return (
    <VStack spacing={4} align="center">
      <Box position="relative" maxW="800px" w="full">
        <Image
          src={'/ipaVowelChart.png'} // Make sure image is in public folder
          alt="IPA Vowel Chart"
          width="100%"
          height="auto"
        />

        {Object.entries(vowelPositions).map(([key, position]) => (
          <Box
            key={key}
            position="absolute"
            top={`${position.top}%`}
            left={`${position.left}%`}
            w="30px"
            h="30px"
            bg={position.vowel ? 'white' : 'rgba(255, 255, 255, 0.5)'}
            border="2px solid"
            borderColor={selectedVowel ? 'teal.500' : 'gray.300'}
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
        ))}
      </Box>

      <Flex wrap="wrap" gap={2}>
        {vowels.map((vowel, index) => (
          <Button
            key={index}
            onClick={() => handleVowelSelect(vowel)}
            variant="outline"
            colorScheme="teal"
          >
            {vowel}
          </Button>
        ))}
      </Flex>
    </VStack>
  )
}
