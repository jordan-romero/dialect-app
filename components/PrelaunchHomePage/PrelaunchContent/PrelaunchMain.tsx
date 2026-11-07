import { Badge, Box, Heading, HStack, Stack, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { fadeUp, stagger, EASE } from '../motion'
import { personas } from './PrelaunchPersonas/utils'

const PrelaunchMain = () => {
  return (
    <Stack
      as={motion.div}
      variants={stagger(0.12, 0.1)}
      initial="hidden"
      animate="show"
      spacing={6}
      maxW={{ base: '100%', lg: '620px' }}
    >
      <motion.div variants={fadeUp} style={{ alignSelf: 'flex-start' }}>
        <Badge
          alignSelf="flex-start"
          bg="whiteAlpha.800"
          color="brand.purple"
          px={3}
          py={1.5}
          borderRadius="full"
          textTransform="none"
          fontSize="sm"
          fontWeight="semibold"
          letterSpacing="0.01em"
          boxShadow="0 1px 2px rgba(0,0,0,0.04)"
        >
          <HStack spacing={2}>
            <Box w="6px" h="6px" borderRadius="full" bg="brand.purple" />
            <Text as="span">Early access coming soon</Text>
          </HStack>
        </Badge>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Heading
          as="h1"
          fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
          fontWeight="black"
          lineHeight="1.05"
          letterSpacing="-0.02em"
          color="gray.900"
          sx={{ textWrap: 'balance' }}
        >
          Master any{' '}
          <Box
            as="span"
            bgGradient="linear(to-r, brand.purple, brand.iris, brand.blue, brand.purple)"
            bgClip="text"
            bgSize="300% 100%"
            sx={{
              animation: 'aa-shimmer 8s ease-in-out infinite',
              '@keyframes aa-shimmer': {
                '0%, 100%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' },
              },
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
          >
            accent or dialect
          </Box>{' '}
          — on your own.
        </Heading>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Text
          fontSize={{ base: 'md', md: 'lg' }}
          color="gray.600"
          lineHeight="1.7"
          sx={{ textWrap: 'pretty' }}
        >
          ActingAccents.com teaches actors and performers the International
          Phonetic Alphabet (IPA) — the systematic method that top dialect
          coaches agree produces the most authentic performances. No more
          guesswork, no more mimicry.
        </Text>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Box pt={2}>
          <PersonaRotator />
          <Text
            mt={3}
            fontSize="sm"
            color="gray.500"
            lineHeight="1.8"
            sx={{ textWrap: 'pretty' }}
          >
            {personas.join(' · ')}
          </Text>
        </Box>
      </motion.div>
    </Stack>
  )
}

// "Built for ___" with the audience cycling in the brand gradient.
const PersonaRotator = () => {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setI((n) => (n + 1) % personas.length), 2200)
    return () => clearInterval(id)
  }, [reduce])

  return (
    <Box aria-label={`Built for ${personas.join(', ')}`} role="group">
      <Text
        aria-hidden
        fontSize="sm"
        fontWeight="bold"
        color="gray.500"
        letterSpacing="0.08em"
        textTransform="uppercase"
      >
        Built for
      </Text>
      <Box
        aria-hidden
        position="relative"
        overflow="hidden"
        h={{ base: '2.6em', md: '1.3em' }}
        fontSize={{ base: '2xl', md: '3xl' }}
        fontWeight="black"
        letterSpacing="-0.02em"
        lineHeight="1.3"
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={personas[i]}
            initial={{ y: '60%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-60%', opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            style={{
              backgroundImage: 'linear-gradient(90deg, #723FC5, #5F53CF)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              width: 'fit-content',
              position: 'absolute',
              left: 0,
              top: 0,
            }}
          >
            {personas[i]}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  )
}

export default PrelaunchMain
