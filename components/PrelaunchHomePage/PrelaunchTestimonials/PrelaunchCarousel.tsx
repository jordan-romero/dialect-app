import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Box,
  Flex,
  Grid,
  HStack,
  Icon,
  IconButton,
  Image,
  Stack,
  Text,
} from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { FaQuoteLeft } from 'react-icons/fa'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { EASE } from '../motion'

interface Card {
  id: number
  testimonial: string
  name: string
  subtitle: string
  image: string
  altText: string
}

interface CardCarouselProps {
  cards: Card[]
}

const INTERVAL_MS = 8000
const RING = 2 * Math.PI * 27 // circumference of the progress ring (r = 27)

// "Cast list" testimonials: one quote on stage, every headshot in a row below.
const CardCarousel: React.FC<CardCarouselProps> = ({ cards }) => {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const castRef = useRef<HTMLDivElement>(null)

  const go = useCallback(
    (next: number) => {
      setExpanded(false)
      setIndex((next + cards.length) % cards.length)
    },
    [cards.length],
  )

  // Auto-advance unless hovering, focused inside, reading the full story, or
  // the visitor prefers reduced motion.
  useEffect(() => {
    if (paused || reduce || expanded) return
    const id = setTimeout(() => go(index + 1), INTERVAL_MS)
    return () => clearTimeout(id)
  }, [index, paused, reduce, expanded, go])

  // Keep the active headshot in view inside the cast row.
  useEffect(() => {
    const row = castRef.current
    const el = row?.querySelector<HTMLElement>(`[data-cast="${index}"]`)
    if (!row || !el) return
    const left = el.offsetLeft - row.clientWidth / 2 + el.clientWidth / 2
    row.scrollTo({ left, behavior: reduce ? 'auto' : 'smooth' })
  }, [index, reduce])

  const card = cards[index]
  const isLong = card.testimonial.length > 360
  const counter = (n: number) => String(n).padStart(2, '0')

  return (
    <Box
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(index + 1)
        if (e.key === 'ArrowLeft') go(index - 1)
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Testimonials"
    >
      {/* Stage */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={(_, info) => {
          if (info.offset.x < -70) go(index + 1)
          else if (info.offset.x > 70) go(index - 1)
        }}
        style={{ touchAction: 'pan-y' }}
      >
        <Grid
          templateColumns={{ base: '1fr', md: '300px 1fr', lg: '360px 1fr' }}
          gap={{ base: 8, md: 12, lg: 16 }}
          alignItems="center"
          minH={{ md: '440px' }}
        >
          {/* Portrait with a curtain-wipe reveal */}
          <Box
            position="relative"
            w={{ base: '72%', md: '100%' }}
            maxW="360px"
            mx={{ base: 'auto', md: 0 }}
          >
            <Box
              position="absolute"
              inset="-14px"
              borderRadius="3xl"
              bgGradient="conic(from 200deg, brand.purple, brand.iris, brand.blue, brand.purple)"
              filter="blur(22px)"
              opacity={0.55}
            />
            <Box
              position="relative"
              borderRadius="3xl"
              overflow="hidden"
              sx={{ aspectRatio: '4 / 5' }}
              bg="whiteAlpha.100"
              boxShadow="0 30px 70px -30px rgba(0,0,0,0.7)"
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={card.id}
                  initial={{ clipPath: 'inset(0 0 100% 0)', scale: 1.08 }}
                  animate={{ clipPath: 'inset(0 0 0% 0)', scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: EASE }}
                  style={{ position: 'absolute', inset: 0 }}
                >
                  <Image
                    src={card.image}
                    alt={card.altText}
                    objectFit="cover"
                    objectPosition="top"
                    w="100%"
                    h="100%"
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>
            </Box>
          </Box>

          {/* Quote */}
          <Box position="relative" minH={{ md: '360px' }}>
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.55, ease: EASE }}
              aria-live={paused ? 'polite' : 'off'}
            >
              <Stack spacing={6}>
                <Icon
                  as={FaQuoteLeft}
                  boxSize={8}
                  color="brand.blue"
                  opacity={0.9}
                />
                <Text
                  fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}
                  color="white"
                  lineHeight="1.55"
                  fontWeight="medium"
                  letterSpacing="-0.01em"
                  noOfLines={expanded ? undefined : { base: 9, md: 7 }}
                  sx={{ textWrap: 'pretty' }}
                >
                  {card.testimonial}
                </Text>
                {isLong && (
                  <Box
                    as="button"
                    onClick={() => setExpanded((v) => !v)}
                    alignSelf="flex-start"
                    color="purple.200"
                    fontWeight="semibold"
                    fontSize="sm"
                    _hover={{ color: 'white' }}
                  >
                    {expanded ? 'Show less' : 'Read the full story'}
                  </Box>
                )}
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
                >
                  <HStack spacing={4}>
                    <Box
                      w="36px"
                      h="2px"
                      bgGradient="linear(to-r, brand.purple, brand.blue)"
                    />
                    <Stack spacing={0}>
                      <Text
                        fontWeight="bold"
                        color="white"
                        fontSize={{ base: 'md', md: 'lg' }}
                      >
                        {card.name}
                      </Text>
                      <Text fontSize="sm" color="purple.200">
                        {card.subtitle}
                      </Text>
                    </Stack>
                  </HStack>
                </motion.div>
              </Stack>
            </motion.div>
          </Box>
        </Grid>
      </motion.div>

      {/* Cast list */}
      <Flex
        mt={{ base: 10, md: 14 }}
        align="center"
        gap={{ base: 3, md: 5 }}
        borderTopWidth="1px"
        borderColor="whiteAlpha.200"
        pt={{ base: 6, md: 8 }}
      >
        <Text
          fontSize="sm"
          fontWeight="bold"
          color="whiteAlpha.700"
          sx={{ fontVariantNumeric: 'tabular-nums' }}
          flexShrink={0}
          display={{ base: 'none', sm: 'block' }}
        >
          <Text as="span" color="white">
            {counter(index + 1)}
          </Text>{' '}
          / {counter(cards.length)}
        </Text>

        <Box
          ref={castRef}
          flex="1"
          overflowX="auto"
          py={2}
          sx={{
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            maskImage:
              'linear-gradient(90deg, transparent, black 6%, black 94%, transparent)',
          }}
        >
          <HStack spacing={3} px={6} w="max-content">
            {cards.map((c, i) => {
              const active = i === index
              return (
                <Box
                  as="button"
                  key={c.id}
                  data-cast={i}
                  onClick={() => go(i)}
                  aria-label={`Show testimonial from ${c.name}`}
                  aria-current={active}
                  title={c.name}
                  position="relative"
                  w="60px"
                  h="60px"
                  flexShrink={0}
                  borderRadius="full"
                  transition="transform 0.25s, opacity 0.25s, filter 0.25s"
                  opacity={active ? 1 : 0.55}
                  filter={active ? 'none' : 'grayscale(0.6)'}
                  transform={active ? 'scale(1.06)' : 'scale(1)'}
                  _hover={{ opacity: 1, filter: 'none' }}
                >
                  <Image
                    src={c.image}
                    alt=""
                    position="absolute"
                    inset="6px"
                    w="48px"
                    h="48px"
                    borderRadius="full"
                    objectFit="cover"
                    objectPosition="top"
                    draggable={false}
                  />
                  {active && (
                    <svg
                      viewBox="0 0 60 60"
                      width="60"
                      height="60"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        transform: 'rotate(-90deg)',
                      }}
                      aria-hidden
                    >
                      <circle
                        cx="30"
                        cy="30"
                        r="27"
                        fill="none"
                        stroke="rgba(255,255,255,0.18)"
                        strokeWidth="2.5"
                      />
                      <motion.circle
                        key={`${c.id}-${paused || expanded}`}
                        cx="30"
                        cy="30"
                        r="27"
                        fill="none"
                        stroke="url(#ringGrad)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray={RING}
                        initial={{
                          strokeDashoffset:
                            reduce || paused || expanded ? 0 : RING,
                        }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{
                          duration:
                            reduce || paused || expanded
                              ? 0
                              : INTERVAL_MS / 1000,
                          ease: 'linear',
                        }}
                      />
                      <defs>
                        <linearGradient
                          id="ringGrad"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#B49BFF" />
                          <stop offset="100%" stopColor="#7EACE2" />
                        </linearGradient>
                      </defs>
                    </svg>
                  )}
                </Box>
              )
            })}
          </HStack>
        </Box>

        <HStack spacing={2} flexShrink={0}>
          <IconButton
            aria-label="Previous testimonial"
            icon={<Icon as={ChevronLeftIcon} boxSize={6} />}
            onClick={() => go(index - 1)}
            {...arrowStyle}
          />
          <IconButton
            aria-label="Next testimonial"
            icon={<Icon as={ChevronRightIcon} boxSize={6} />}
            onClick={() => go(index + 1)}
            {...arrowStyle}
          />
        </HStack>
      </Flex>
    </Box>
  )
}

const arrowStyle = {
  w: '44px',
  h: '44px',
  minW: '44px',
  borderRadius: 'full',
  bg: 'whiteAlpha.100',
  color: 'white',
  borderWidth: '1px',
  borderColor: 'whiteAlpha.300',
  _hover: { bg: 'white', color: 'brand.purple' },
}

export default CardCarousel
