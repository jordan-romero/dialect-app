import React, { useEffect, useState } from 'react'
import { Box, Flex, Grid, HStack, Text } from '@chakra-ui/react'
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from 'framer-motion'
import { EASE } from '../motion'

// Decorative, animated headers for the three "Why ActingAccents" cards. They
// illustrate the card copy; they don't add claims of their own.

const panel = {
  position: 'relative' as const,
  borderRadius: 'xl',
  overflow: 'hidden',
  bgGradient: 'linear(to-br, #F3EEFF, #E9ECFF 55%, #E4F4FA)',
  borderWidth: '1px',
  borderColor: 'purple.50',
}

// 1. Our Promise: tiles from the IPA chart lighting up one after another.
const CHART = [
  'p',
  'b',
  't',
  'd',
  'k',
  'g',
  'θ',
  'ð',
  's',
  'z',
  'ʃ',
  'ʒ',
  'm',
  'n',
  'ŋ',
  'l',
  'ɹ',
  'j',
  'i',
  'ɪ',
  'ɛ',
  'æ',
  'ə',
  'ɑ',
  'ɔ',
  'ʊ',
  'u',
  'ʌ',
]

export const ChartVisual = () => {
  const reduce = useReducedMotion()
  const [lit, setLit] = useState(6)
  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setLit((n) => (n + 5) % CHART.length), 900)
    return () => clearInterval(id)
  }, [reduce])

  return (
    <Flex
      {...panel}
      p={{ base: 4, md: 6 }}
      h="100%"
      minH="220px"
      align="center"
      justify="center"
    >
      <Grid
        w="100%"
        maxW="520px"
        templateColumns="repeat(7, 1fr)"
        gap={{ base: 1.5, md: 2 }}
      >
        {CHART.map((g, i) => {
          const on =
            i === lit ||
            i === (lit + 9) % CHART.length ||
            i === (lit + 17) % CHART.length
          return (
            <motion.div
              key={g}
              animate={{
                backgroundColor: on ? '#723FC5' : 'rgba(255,255,255,0.85)',
                color: on ? '#FFFFFF' : '#4A4560',
                scale: on ? 1.08 : 1,
              }}
              transition={{ duration: 0.45, ease: EASE }}
              style={{
                aspectRatio: '1',
                borderRadius: 10,
                display: 'grid',
                placeItems: 'center',
                fontFamily: "'Charis SIL', 'Doulos SIL', serif",
                fontSize: 'clamp(15px, 2vw, 22px)',
                boxShadow: on
                  ? '0 8px 18px -8px rgba(114,63,197,0.7)'
                  : '0 1px 2px rgba(17,24,39,0.06)',
              }}
            >
              {g}
            </motion.div>
          )
        })}
      </Grid>
    </Flex>
  )
}

// 2. The IPA Advantage: a script line marked up in IPA, the way actors do it.
const LINE: [string, string][] = [
  ['To', 'tə'],
  ['be,', 'bi'],
  ['or', 'ɔɹ'],
  ['not', 'nɑt'],
  ['to', 'tə'],
  ['be', 'bi'],
]

export const ScriptVisual = () => {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <Box ref={ref} {...panel} px={{ base: 4, md: 6 }} py={{ base: 5, md: 6 }}>
      <Text
        fontSize="xs"
        fontWeight="bold"
        letterSpacing="0.12em"
        color="purple.400"
        textTransform="uppercase"
        mb={3}
      >
        Hamlet, Act 3
      </Text>
      <Flex wrap="wrap" columnGap={3} rowGap={2}>
        {LINE.map(([word, ipa], i) => (
          <Box key={i} textAlign="center">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.4, ease: EASE, delay: 0.3 + i * 0.22 }}
              style={{
                fontFamily: "'Charis SIL', 'Doulos SIL', serif",
                color: '#723FC5',
                fontSize: 17,
                lineHeight: 1.2,
              }}
            >
              {ipa}
            </motion.div>
            <Text
              fontFamily="longBody"
              fontSize={{ base: 'xl', md: '2xl' }}
              color="gray.800"
              lineHeight="1.2"
            >
              {word}
            </Text>
          </Box>
        ))}
      </Flex>
    </Box>
  )
}

// 3. Complete Control: flip one word between two accents.
const ACCENTS = [
  { label: 'American', ipa: '/bæθ/' },
  { label: 'British RP', ipa: '/bɑːθ/' },
]

export const AccentToggleVisual = () => {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setI((n) => (n + 1) % ACCENTS.length), 2400)
    return () => clearInterval(id)
  }, [reduce])

  return (
    <Flex
      {...panel}
      px={{ base: 4, md: 6 }}
      py={{ base: 5, md: 6 }}
      align="center"
      justify="space-between"
      gap={4}
      wrap="wrap"
    >
      <Box>
        <Text
          fontFamily="longBody"
          fontSize={{ base: '2xl', md: '3xl' }}
          color="gray.800"
          lineHeight="1.1"
        >
          bath
        </Text>
        <Box h="32px" position="relative" overflow="hidden" minW="90px">
          <AnimatePresence initial={false}>
            <motion.div
              key={ACCENTS[i].ipa}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                fontFamily: "'Charis SIL', 'Doulos SIL', serif",
                color: '#723FC5',
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {ACCENTS[i].ipa}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
      <HStack
        as="button"
        type="button"
        onClick={() => setI((n) => (n + 1) % ACCENTS.length)}
        aria-label={`Showing ${ACCENTS[i].label}. Switch accent`}
        spacing={0}
        p={1}
        bg="white"
        borderRadius="full"
        boxShadow="0 1px 2px rgba(17,24,39,0.08)"
        position="relative"
      >
        {ACCENTS.map((a, k) => (
          <Box
            key={a.label}
            position="relative"
            px={3}
            py={1.5}
            fontSize="sm"
            fontWeight="semibold"
          >
            {i === k && (
              <motion.div
                layoutId="accent-pill"
                transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 9999,
                  background: 'linear-gradient(90deg, #723FC5, #5F53CF)',
                }}
              />
            )}
            <Text
              as="span"
              position="relative"
              color={i === k ? 'white' : 'gray.600'}
              transition="color 0.2s"
            >
              {a.label}
            </Text>
          </Box>
        ))}
      </HStack>
    </Flex>
  )
}
