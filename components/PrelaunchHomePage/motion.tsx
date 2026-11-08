import React, { useEffect, useState } from 'react'
import { Box, Flex, Text } from '@chakra-ui/react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  Variants,
} from 'framer-motion'

// Shared motion building blocks for the launch page. Everything here respects
// the visitor's "reduce motion" setting: decorative loops stop, and entrances
// become simple fades (MotionConfig reducedMotion="user" on the page root).

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

export const stagger = (gap = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
})

/** Fades + lifts its children into place the first time they scroll into view. */
export const Reveal = ({
  children,
  delay = 0,
  y = 28,
}: {
  children: React.ReactNode
  delay?: number
  y?: number
}) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.8, ease: EASE, delay }}
  >
    {children}
  </motion.div>
)

/** Thin brand-gradient bar pinned to the top that fills as you scroll. */
export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  return (
    <motion.div
      aria-hidden
      style={{
        scaleX,
        transformOrigin: '0% 50%',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 1400,
        background: 'linear-gradient(90deg, #723FC5, #5F53CF, #7EACE2)',
      }}
    />
  )
}

// IPA symbols scattered behind the hero. Positions are fixed (not random) so
// server and client render the same markup.
const GLYPHS = [
  { g: 'ð', x: '47%', y: '24%', s: 64, d: 0 },
  { g: 'ə', x: '44%', y: '8%', s: 46, d: 1.2 },
  { g: 'θ', x: '88%', y: '12%', s: 58, d: 0.6 },
  { g: 'ʃ', x: '3%', y: '62%', s: 52, d: 2.1 },
  { g: 'ŋ', x: '52%', y: '88%', s: 60, d: 1.6 },
  { g: 'æ', x: '93%', y: '58%', s: 50, d: 0.3 },
  { g: 'ʒ', x: '30%', y: '92%', s: 42, d: 2.6 },
  { g: 'ɑ', x: '72%', y: '4%', s: 40, d: 1.9 },
  { g: 'ɪ', x: '46%', y: '60%', s: 34, d: 3 },
  { g: 'ʊ', x: '64%', y: '46%', s: 36, d: 0.9 },
]

// For centered heroes, keep every symbol out at the edges.
const EDGE_GLYPHS = [
  { g: 'ð', x: '5%', y: '16%', s: 60, d: 0 },
  { g: 'ə', x: '14%', y: '70%', s: 46, d: 1.2 },
  { g: 'θ', x: '88%', y: '14%', s: 58, d: 0.6 },
  { g: 'ʃ', x: '3%', y: '48%', s: 50, d: 2.1 },
  { g: 'ŋ', x: '84%', y: '74%', s: 56, d: 1.6 },
  { g: 'æ', x: '93%', y: '44%', s: 48, d: 0.3 },
  { g: 'ʒ', x: '10%', y: '88%', s: 40, d: 2.6 },
  { g: 'ɑ', x: '78%', y: '6%', s: 38, d: 1.9 },
]

export const FloatingGlyphs = ({
  layout = 'split',
}: {
  layout?: 'split' | 'center'
}) => {
  const glyphs = layout === 'center' ? EDGE_GLYPHS : GLYPHS
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const drift = useTransform(scrollY, [0, 800], [0, -120])

  return (
    <Box
      aria-hidden
      position="absolute"
      inset={0}
      pointerEvents="none"
      zIndex={0}
      overflow="hidden"
      opacity={{ base: 0.45, md: 1 }}
    >
      <motion.div
        style={{ position: 'absolute', inset: 0, y: reduce ? 0 : drift }}
      >
        {glyphs.map(({ g, x, y, s, d }) => (
          <motion.span
            key={g + x}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={
              reduce
                ? { opacity: 0.14, scale: 1 }
                : {
                    opacity: [0, 0.16, 0.12, 0.16],
                    scale: 1,
                    y: [0, -14, 0, 10, 0],
                    rotate: [0, 4, 0, -4, 0],
                  }
            }
            transition={
              reduce
                ? { duration: 0.6 }
                : {
                    opacity: { duration: 2, delay: d * 0.3 },
                    scale: { duration: 1.2, delay: d * 0.3, ease: EASE },
                    y: { duration: 9 + d, repeat: Infinity, ease: 'easeInOut' },
                    rotate: {
                      duration: 11 + d,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }
            }
            style={{
              position: 'absolute',
              left: x,
              top: y,
              fontSize: s,
              lineHeight: 1,
              color: '#723FC5',
              fontFamily: "'Charis SIL', 'Doulos SIL', serif",
            }}
          >
            {g}
          </motion.span>
        ))}
      </motion.div>
    </Box>
  )
}

// Words and their General American IPA, cycled under the video.
const TRANSCRIPTIONS = [
  { word: 'accent', ipa: '/ˈæk.sɛnt/' },
  { word: 'dialect', ipa: '/ˈdaɪ.ə.lɛkt/' },
  { word: 'theater', ipa: '/ˈθi.ə.tɚ/' },
  { word: 'voice', ipa: '/vɔɪs/' },
  { word: 'actor', ipa: '/ˈæk.tɚ/' },
]

/** Small floating card that turns a word into IPA, one at a time. */
export const IpaTicker = () => {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)

  useEffect(() => {
    if (reduce) return
    const id = setInterval(
      () => setI((n) => (n + 1) % TRANSCRIPTIONS.length),
      2600,
    )
    return () => clearInterval(id)
  }, [reduce])

  const { word, ipa } = TRANSCRIPTIONS[i]

  return (
    <Flex
      align="center"
      gap={3}
      bg="whiteAlpha.900"
      backdropFilter="blur(10px)"
      borderRadius="xl"
      px={4}
      py={3}
      boxShadow="0 18px 40px -16px rgba(30,20,70,0.35)"
      borderWidth="1px"
      borderColor="whiteAlpha.800"
      minW="250px"
      role="img"
      aria-label={`${word}, written in IPA as ${ipa}`}
    >
      <Box
        w="34px"
        h="34px"
        borderRadius="lg"
        bgGradient="linear(to-br, brand.purple, brand.iris)"
        color="white"
        display="grid"
        placeItems="center"
        fontFamily="ipa"
        fontSize="lg"
        flexShrink={0}
      >
        ə
      </Box>
      <Box position="relative" h="40px" flex="1" overflow="hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={word}
            initial={{ y: 12, opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              transition: { duration: 0.32, ease: EASE },
            }}
            exit={{
              y: -8,
              opacity: 0,
              transition: { duration: 0.16, ease: 'easeIn' },
            }}
          >
            <Text
              fontSize="xs"
              color="gray.500"
              fontWeight="semibold"
              lineHeight="1.2"
            >
              {word}
            </Text>
            <Text
              fontFamily="ipa"
              fontSize="lg"
              color="brand.purple"
              fontWeight="bold"
              lineHeight="1.3"
            >
              {ipa}
            </Text>
          </motion.div>
        </AnimatePresence>
      </Box>
    </Flex>
  )
}

const SYMBOL_NAMES = [
  ['ə', 'schwa'],
  ['θ', 'theta'],
  ['ð', 'eth'],
  ['ʃ', 'esh'],
  ['ŋ', 'eng'],
  ['æ', 'ash'],
  ['ʒ', 'ezh'],
  ['ʊ', 'upsilon'],
  ['ɑ', 'script a'],
  ['ɛ', 'epsilon'],
]

/** Endless band of IPA symbols and their names. */
export const GlyphMarquee = () => {
  const reduce = useReducedMotion()
  const row = [...SYMBOL_NAMES, ...SYMBOL_NAMES]

  return (
    <Box
      aria-hidden
      bgGradient="linear(to-r, brand.purple, brand.iris)"
      color="white"
      py={{ base: 4, md: 5 }}
      overflow="hidden"
      position="relative"
      sx={{
        maskImage:
          'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
      }}
    >
      <motion.div
        style={{ display: 'flex', width: 'max-content' }}
        animate={reduce ? undefined : { x: ['0%', '-50%'] }}
        transition={{ duration: 38, ease: 'linear', repeat: Infinity }}
      >
        {row.map(([g, name], i) => (
          <Flex key={i} align="baseline" gap={2.5} px={{ base: 5, md: 8 }}>
            <Text
              as="span"
              fontFamily="ipa"
              fontSize={{ base: '2xl', md: '3xl' }}
              lineHeight="1"
            >
              {g}
            </Text>
            <Text
              as="span"
              fontSize="sm"
              fontWeight="semibold"
              letterSpacing="0.12em"
              textTransform="uppercase"
              opacity={0.8}
              whiteSpace="nowrap"
            >
              {name}
            </Text>
            <Text as="span" pl={{ base: 5, md: 8 }} opacity={0.4}>
              ✦
            </Text>
          </Flex>
        ))}
      </motion.div>
    </Box>
  )
}
