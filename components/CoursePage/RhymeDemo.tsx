import React, { useState } from 'react'
import { Box, Button, Flex, Grid, Stack, Text } from '@chakra-ui/react'
import { motion, useReducedMotion } from 'framer-motion'
import { EASE } from '../PrelaunchHomePage/motion'

// Question 1 of "Rhyming Words", the exercise in the free lesson "Why the IPA?".
type Word = { word: string; ipa: string; pair?: string }

const LEFT: Word[] = [
  { word: 'Tough', ipa: '/tʌf/', pair: 'Rough' },
  { word: 'Through', ipa: '/θɹu/' },
  { word: 'Plough', ipa: '/plaʊ/', pair: 'Bough' },
  { word: 'Dough', ipa: '/doʊ/', pair: 'Though' },
]
const RIGHT: Word[] = [
  { word: 'Rough', ipa: '/ɹʌf/' },
  { word: 'Cough', ipa: '/kɑf/' },
  { word: 'Bough', ipa: '/baʊ/' },
  { word: 'Though', ipa: '/ðoʊ/' },
]
const PAIRS = LEFT.filter((w) => w.pair).length

/** A playable copy of the course's first exercise. */
const RhymeDemo = () => {
  const reduce = useReducedMotion()
  const [picked, setPicked] = useState<string | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const [miss, setMiss] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  const done = matched.length === PAIRS * 2
  const showIpa = done || revealed

  const pickLeft = (w: Word) => {
    if (matched.includes(w.word) || revealed) return
    setMiss(null)
    setPicked((p) => (p === w.word ? null : w.word))
  }

  const pickRight = (w: Word) => {
    if (!picked || matched.includes(w.word) || revealed) return
    const left = LEFT.find((l) => l.word === picked)
    if (left?.pair === w.word) {
      setMatched((m) => [...m, picked, w.word])
    } else {
      setMiss(`${picked}-${w.word}`)
      setTimeout(() => setMiss(null), 600)
    }
    setPicked(null)
  }

  const reset = () => {
    setPicked(null)
    setMatched([])
    setMiss(null)
    setRevealed(false)
  }

  const reveal = () => {
    setRevealed(true)
    setPicked(null)
    setMatched(
      LEFT.filter((l) => l.pair).flatMap((l) => [l.word, l.pair as string]),
    )
  }

  const wordButton = (w: Word, side: 'left' | 'right') => {
    const isMatched = matched.includes(w.word)
    const isPicked = picked === w.word
    const isMiss = !!miss && miss.split('-').includes(w.word)
    const waiting = side === 'right' && !picked && !isMatched && !revealed
    const ipaOn = showIpa || isMatched

    return (
      <motion.div
        key={w.word}
        animate={isMiss && !reduce ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box
          as="button"
          type="button"
          onClick={() => (side === 'left' ? pickLeft(w) : pickRight(w))}
          aria-pressed={side === 'left' ? isPicked : undefined}
          aria-label={`${w.word}${isMatched ? ', matched' : ''}`}
          w="100%"
          minH={{ base: '52px', md: '58px' }}
          px={3}
          py={2}
          borderRadius="xl"
          borderWidth="1.5px"
          fontWeight="semibold"
          fontSize={{ base: 'md', md: 'lg' }}
          cursor={isMatched || revealed ? 'default' : 'pointer'}
          transition="background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s"
          bg={
            isMatched
              ? 'green.500'
              : isPicked
              ? 'brand.iris'
              : isMiss
              ? 'red.50'
              : 'white'
          }
          color={isMatched || isPicked ? 'white' : 'gray.800'}
          borderColor={
            isMatched
              ? 'green.500'
              : isPicked
              ? 'brand.iris'
              : isMiss
              ? 'red.300'
              : 'gray.200'
          }
          opacity={waiting ? 0.85 : 1}
          _hover={
            isMatched || revealed
              ? undefined
              : {
                  borderColor: isPicked ? 'brand.iris' : 'purple.300',
                  transform: 'translateY(-1px)',
                }
          }
          _focusVisible={{
            outline: '2px solid',
            outlineColor: 'brand.purple',
            outlineOffset: '2px',
          }}
        >
          <Text as="span" display="block" lineHeight="1.2">
            {w.word}
          </Text>
          <Text
            as="span"
            display="block"
            fontFamily="ipa"
            fontWeight="normal"
            fontSize="sm"
            lineHeight="1.3"
            color={
              isMatched || isPicked
                ? 'whiteAlpha.900'
                : ipaOn
                ? 'brand.purple'
                : 'gray.300'
            }
            transition="color 0.3s"
            aria-hidden={!ipaOn}
          >
            {ipaOn ? w.ipa : '/ ? /'}
          </Text>
        </Box>
      </motion.div>
    )
  }

  return (
    <Box
      bg="white"
      borderRadius="3xl"
      borderWidth="1px"
      borderColor="purple.100"
      boxShadow="0 2px 4px rgba(17,24,39,0.04), 0 36px 72px -40px rgba(30,20,70,0.5)"
      p={{ base: 5, md: 8 }}
    >
      <Flex justify="space-between" align="baseline" gap={4} wrap="wrap" mb={2}>
        <Text
          fontWeight="black"
          fontSize={{ base: 'lg', md: 'xl' }}
          color="gray.900"
        >
          Rhyming Words
        </Text>
        <Text fontSize="sm" color="gray.500" aria-live="polite">
          {matched.length / 2} of {PAIRS} pairs
        </Text>
      </Flex>
      <Text
        color="gray.600"
        fontSize={{ base: 'sm', md: 'md' }}
        lineHeight="1.6"
        mb={6}
      >
        Tap a word on the left, then the word on the right that rhymes with it
        in General American. Careful: some words have no partner.
      </Text>

      <Grid templateColumns="1fr 1fr" gap={{ base: 3, md: 5 }}>
        <Stack spacing={{ base: 2.5, md: 3 }}>
          {LEFT.map((w) => wordButton(w, 'left'))}
        </Stack>
        <Stack spacing={{ base: 2.5, md: 3 }}>
          {RIGHT.map((w) => wordButton(w, 'right'))}
        </Stack>
      </Grid>

      {/* Fixed-height footer so finishing never shifts the page. */}
      <Box mt={6} h={{ base: '150px', sm: '120px', md: '104px' }}>
        {showIpa ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <Text
              color="gray.700"
              fontSize={{ base: 'sm', md: 'md' }}
              lineHeight="1.6"
            >
              <Box as="span" fontWeight="bold" color="gray.900">
                {done && !revealed ? 'Nailed it. ' : 'Here’s the answer. '}
              </Box>
              Eight words spelled{' '}
              <Box as="span" fontStyle="italic">
                -ough
              </Box>
              , five different sounds. The IPA writes each one the same way
              every time, which is why actors learn it.
            </Text>
            <Button
              mt={3}
              size="sm"
              variant="ghost"
              color="brand.purple"
              onClick={reset}
            >
              Try it again
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Flex align="center" justify="space-between" gap={3} wrap="wrap">
              <Text fontSize="sm" color="gray.500">
                {picked
                  ? `Now pick the rhyme for “${picked}”.`
                  : 'Start with any word on the left.'}
              </Text>
              <Button
                size="sm"
                variant="ghost"
                color="gray.600"
                onClick={reveal}
              >
                Show me the answer
              </Button>
            </Flex>
          </motion.div>
        )}
      </Box>
    </Box>
  )
}

export default RhymeDemo
